const Router = require('express').Router;
const Datastore = require('nedb');

var db = new Datastore({filename: '../database/datastoreKV.db', autoload: true});
db.ensureIndex({fieldName: 'key', unique: true});
db.ensureIndex({fieldName: 'datasource_id', unique: false});

// TODO: Consider OOP-ing this whole thing

module.exports.api = function (subscriptionManager) {
	var router = Router({mergeParams: true});

	// TODO: .all, see #15
	router.get('/', (req, res) => {
		var key = req.params.key;

		db.findOne({ key }, function (err, document) {
			if (err) {
				console.log("[Error]::", req.originalUrl);
				// TODO: Document
				res.status(500).send({ status: 500, error: err });
				return;
			}

			if(document == null) {
				res.status(404).send({ status: 404, error: 'Document not found' });
				return;
			}

			res.send(document.data);
		});
	});

	// TODO: .all, see #15
	router.post('/', (req, res) => {
		var key = req.params.key;
		var data = req.body;
		var doc = {
			key: key,
			data: data
		};

		db.update({ key }, doc, { upsert: true, returnUpdatedDocs: true }, function (err, numAffected, affectedDocuments, upsert) {
			if (err) {
				console.log("[Error]::", req.originalUrl, doc, err);
				// TODO: Document
				res.status(500).send({ status: 500, error: err });
				return;
			}
			res.send(affectedDocuments.data);
		});

		subscriptionManager.emit(key + '/key', {
			datasource_id: key,
			data: data,
		});
	});

	return router;
};
