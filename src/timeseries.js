const Router = require('express').Router;
const Datastore = require('nedb');

const db = new Datastore({filename: '../database/datastore.db', autoload: true});
db.ensureIndex({fieldName: 'sensor_id', unique: false});
db.ensureIndex({fieldName: 'timestamp', unique: false});
db.ensureIndex({fieldName: 'vendor_id', unique: false});

// TODO: Consider OOP-ing this whole thing

module.exports.read = function () {
	var router = Router({mergeParams: true});

	var latest = function (req, res, next) {
		var sensor_id = req.params.sensor;
		db.find({ sensor_id: sensor_id }).sort({ timestamp: -1 }).limit(1).exec(function (err, doc) {
			if (err) {
				console.log('[Error]::', req.originalUrl);
				// TODO: Status code + document
				res.send(err);
			}
			res.send(doc);
		});
	};

	var since = function (req, res, next) {
		var sensor_id = req.params.sensor;
		var timestamp = req.body.timestamp;
		db.find({ sensor_id, $where: function () { return this.timestamp > timestamp; } }).sort({ timestamp: 1 }).exec(function (err, doc) {
			if (err) {
				console.log('[Error]::', req.originalUrl, timestamp);
				// TODO: Status code + document
				res.send(err);
			}
			res.send(doc);
		});
	};

	var range = function (req, res, next) {
		var sensor_id = req.params.sensor;
		var start = req.body.start;
		var end = req.body.end;

		db.find({ sensor_id, $where: function () { return this.timestamp >= start && this.timestamp <= end; } }).sort({ timestamp: 1 }).exec(function (err, doc) {
			if (err) {
				console.log('[Error]::', req.originalUrl, timestamp);
				// TODO: Status code + document
				res.send(err);
			}
			res.send(doc);
		});
	};

	router.post('/', function (req, res, next) {
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

	return router;
};

module.exports.write = function (subscriptionManager) {
	var router = Router({mergeParams: true});

	// TODO: .all, see #15
	router.post('/', function (req, res, next) {
		var data = {
			'data':      req.body.data,
			'sensor_id': req.params.sensor,
			'vendor_id': req.params.vendor_id,
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

		data.path = '/ts/' + req.params.sensor;

		subscriptionManager.emit(data.path, data);
	});

	return router;
};
