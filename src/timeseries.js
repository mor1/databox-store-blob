const Router = require('express').Router;
const Datastore = require('nedb');

const db = new Datastore({filename: '../database/datastore.db', autoload: true});
db.ensureIndex({fieldName: 'datasource_id', unique: false});
db.ensureIndex({fieldName: 'timestamp', unique: false});

// TODO: Consider OOP-ing this whole thing

module.exports.api = function (subscriptionManager) {
	var router = Router({mergeParams: true});

	var latest = function (req, res, next) {
		var datasource_id = req.params.datasourceid;
		db.find({ datasource_id: datasource_id }).sort({ timestamp: -1 }).limit(1).exec(function (err, doc) {
			if (err) {
				console.log('[Error]::', req.originalUrl);
				// TODO: Status code + document
				res.send(err);
			}
			res.send(doc);
		});
	};

	var since = function (req, res, next) {
		var datasource_id = req.params.datasourceid;
		var timestamp = req.params.timestamp;
		db.find({ datasource_id, $where: function () { return this.timestamp > timestamp; } }).sort({ timestamp: 1 }).exec(function (err, doc) {
			if (err) {
				console.log('[Error]::', req.originalUrl, timestamp);
				// TODO: Status code + document
				res.send(err);
			}
			res.send(doc);
		});
	};

	var range = function (req, res, next) {
		var datasource_id = req.params.datasourceid;
		var start = req.params.timestamp;
		var end = req.params.endtimestamp;

		db.find({ datasource_id, $where: function () { return this.timestamp >= start && this.timestamp <= end; } }).sort({ timestamp: 1 }).exec(function (err, doc) {
			if (err) {
				console.log('[Error]::', req.originalUrl, timestamp);
				// TODO: Status code + document
				res.send(err);
			}
			res.send(doc);
		});
	};

	router.get('/', function (req, res, next) {

		var cmd = req.params.cmd;
		if(cmd == 'latest') {
			latest(req, res, next);
		}
		if(cmd == 'since') {
			since(req, res, next);
		}
		if(cmd == 'range') {
			range(req, res, next);
		}
		
	});

	// TODO: .all, see #15
	router.post('/', function (req, res, next) {
		var data = {
			datasource_id: req.params.datasourceid,
			'data': req.body.data,
			'timestamp': Date.now()
		};

		db.insert(data, function (err, doc) {
			if (err) {
				console.log('[Error]::', req.originalUrl, data, err);
				// TODO: Status code + document
				res.send(err);
			}
			res.send(doc);
		});

		subscriptionManager.emit(req.params.sensor + '/ts', data);
	});

	return router;
};
