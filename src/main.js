var express = require("express");
var bodyParser = require("body-parser");
var databox_directory = require("./utils/databox_directory.js");

var Datastore = require('nedb');
db = new Datastore({filename: '../database/datastore.db', autoload: true});
db.ensureIndex({fieldName: 'sensor_id', unique: false});
db.ensureIndex({fieldName: 'timestamp', unique: false});
db.ensureIndex({fieldName: 'vendor_id', unique: false});

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//TODO app.use(Macaroon checker);


app.get("/status", function(req, res) {
    res.send("active");
});

app.post("/api/data", function(req, res, next) {
   
    var data = {
    	"data": req.body.data,
    	"sensor_id": req.body.sensor_id,
    	"vendor_id": req.body.vendor_id,
    	"timestamp": Date.now()
	};

    db.insert(data, function (err, doc) {
		if (err) {
			console.log("[Error]:: /data/", data);
      		res.send(err);
		}
		res.send(doc);
	})
});

app.post('/api/data/latest', function(req, res, next) {
    var sensor_id = req.body.sensor_id;
    db.find({sensor_id: sensor_id}).sort({timestamp: -1}).limit(1).exec(function (err, doc) {
		if (err) {
			console.log("[Error]:: /data/latest", sensor_id);
      		res.send(err);
		}
		res.send(doc);
	});
});

app.post('/api/data/since', function(req, res, next) {
    var sensor_id = req.body.sensor_id;
    var timestamp = req.body.timestamp;
    db.find({sensor_id: sensor_id, $where: function(){return this.timestamp > timestamp} }).sort({timestamp: 1}).exec(function (err, doc) {
		if (err) {
			console.log("[Error]:: /data/since", sensor_id, timestamp);
      		res.send(err);
		}
		res.send(doc);
	});
});

app.post('/api/data/range', function(req, res, next) {
    var sensor_id = req.body.sensor_id;
    var start = req.body.start;
    var end = req.body.end;

    db.find({sensor_id: sensor_id, $where: function(){return this.timestamp >= start && this.timestamp <= end;} }).sort({timestamp: 1}).exec(function (err, doc) {
		if (err) {
			console.log("[Error]:: /data/range", sensor_id, timestamp);
      		res.send(err);
		}
		res.send(doc);
	});
});

databox_directory.register_datastore('databox-store-blob', ':8080/')
  .then( (ids)=>{
	   app.listen(8080);
  })
  .catch((err) => {
  	console.log(err)
  });

 module.exports = app;