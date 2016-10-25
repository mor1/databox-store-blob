
module.exports = function (expressApp) {
    
    var Datastore = require('nedb');
    var db = new Datastore({filename: '../database/datastore.db', autoload: true});
    db.ensureIndex({fieldName: 'sensor_id', unique: false});
    db.ensureIndex({fieldName: 'timestamp', unique: false});
    db.ensureIndex({fieldName: 'vendor_id', unique: false});

    var router = require('express').Router();

    var app = expressApp;

    router.get("/",function (eq, res, next) {
      res.send("hello");
    });

    router.post("/", function(req, res, next) {
      
        var data = {
          "data": req.body.data,
          "sensor_id": req.body.sensor_id,
          "vendor_id": req.body.vendor_id,
          "timestamp": Date.now()
        };

        db.insert(data, function (err, doc) {
        if (err) {
          console.log("[Error]:: /data/", data, err);
              res.send(err);
        }
        res.send(doc);
      });

      app.broadcastDataOverWebSocket(req.body.sensor_id,data,'ts');

    });

    router.post('/latest', function(req, res, next) {
        var sensor_id = req.body.sensor_id;
        db.find({sensor_id: sensor_id}).sort({timestamp: -1}).limit(1).exec(function (err, doc) {
          if (err) {
            console.log("[Error]:: /data/latest", sensor_id);
                res.send(err);
          }
          res.send(doc);
        });
    });

    router.post('/since', function(req, res, next) {
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

    router.post('/range', function(req, res, next) {
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

   return router;
} 