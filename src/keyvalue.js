
module.exports = function (expressApp) {
    
    var Datastore = require('nedb');
    var db = new Datastore({filename: '../database/datastoreKV.db', autoload: true});
    db.ensureIndex({fieldName: 'key', unique: true});
    db.ensureIndex({fieldName: 'sensor_id', unique: false});
    db.ensureIndex({fieldName: 'vendor_id', unique: false});

    var router = require('express').Router();

    var app = expressApp;

    router.post("/:key", function(req, res, next) {
        
        var key = req.params.key;
        var doc = {
                    key:key,
                    data:req.body
                  };

        db.update({ key:key }, doc, { upsert: true, returnUpdatedDocs: true }, function (err, numAffected, affectedDocuments, upsert) {
            if (err) {
                console.log("[Error]:: POST /" + key, doc, err);
                res.status(500).send({status:500,error:err});
            }
            res.send(affectedDocuments.data);
        });

        app.broadcastDataOverWebSocket(key,req.body,'kv');

    });

    router.get('/:key', function(req, res, next) {
        var key = req.params.key;
        db.findOne({key: key}, function (err, document) {
          if (err) {
            console.log("[Error]:: /key/" + key);
            res.status(500).send({status:500,error:err});
          }

          if(document == null) {
            res.status(404).send({status:404,error:"Document not found."});
          } else {
            res.send(document.data);
          }
        });
    });

   return router;
} 