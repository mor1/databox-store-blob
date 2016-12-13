var request = require('request');
var cat = require('./base-cat.json');

var DATABOX_LOCAL_NAME = process.env.DATABOX_LOCAL_NAME || "databox-store-blob";
var PORT = process.env.DATABOX_PORT || 8080;

// To avoid O(N) search if scaling to a zillion stores
var hrefMap = {};

// TODO: Do we actually want to force Databox rels despite PAS? Could come later?
var requiredRels = [
	'urn:X-databox:rels:hasVendor',
	'urn:X-databox:rels:hasType',
	'urn:X-databox:rels:hasUnit',
	'urn:X-databox:rels:hasLocation'
	//'urn:X-databox:rels:isActuator'
];

/**
 * @return {Boolean} isValid
 */
var isValidItem = function (item) {
	if (!('item-metadata' in item &&
				'href'          in item))
		return false;

	// Hypercat minimum
	var hasDescription = false;
	var hasContentType = false;

	// Databox minimum (yay/nay?)
	var required = requiredRels.slice(0);

	for(var i = 0, len = item['item-metadata'].length; i < len; ++i) {
		var pair = item['item-metadata'][i];
		if (!('rel' in pair &&
					'val' in pair))
			return false;

		if (pair.rel.startsWith('urn:X-hypercat:rels:hasDescription:')) {
			hasDescription = true;
			continue;
		}

		if (pair.rel === 'urn:X-hypercat:rels:isContentType') {
			hasContentType = true;
			continue;
		}

		if (~required.indexOf(pair.rel))
			required.splice(required.indexOf(pair.rel), 1);
	}

	return hasDescription && hasContentType && !required.length;
}

module.exports = function (expressApp) {

	var router = require('express').Router({mergeParams: true});

	var app = expressApp;

	// Add a data source to the current Hypercat catalogue
	// Content-Type: application/json
	router.post('/', function (req, res, next) {
		// TODO: Extra auth to differentiate between GET and POST /cat

		const item = req.body;

		if (!isValidItem(item)) {
			// PAS Table 8
			res.status(400).send();
			return;
		}

		// TODO: Decide exactly what is best to do here, since Hypercat specs can't decide
		if (item.href in hrefMap) {
			var existingItem = hrefMap[item.href];
			for (key in existingItem)
				delete existingItem[key];
			for (key in item)
				existingItem[key] = item[key];

			// PAS 5.4.3
			// NOTE: PAS ambiguous about this in several ways
			res.header('Location', 'https://' + DATABOX_LOCAL_NAME + ':' + PORT);
			res.status(200).send();
			return;
		}

		hrefMap[item.href] = item;
		cat.items.push(item);

		// PAS 5.4.2
		res.header('Location', 'https://' + DATABOX_LOCAL_NAME + ':' + PORT);
		res.status(201).send();
	});

	//Return the current Hypercat catalogue
	router.get('/', function (req, res, next) {
		res.header('Content-Type', 'application/json');
		res.send(cat);
	});

	return router;
};
