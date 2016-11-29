
module.exports = function (expressApp,database) {

    var request = require('request'); 

    var router = require('express').Router();
    
    var db = database;
    

    var app = expressApp;
    
     //search logs hy hostname
     router.get('/hostname/:hostname', function(req, res, next) {
        var hostname = req.params.hostname;
        console.log("looking for logs for hostname:: " + hostname);
        db.find({'hostname': hostname}, function (err, documents) {
          if (err) {
            console.log("[Error]:: /log/hostname/" + hostname);
            res.status(500).send({status:500,error:err});
          }

          if(documents.length === 0) {
            res.status(404).send({status:404,error:"No documents not found."});
          } else {
            res.send(documents);
          }
        });
    });

    //search logs by end point 
    //TODO: only works for 1 level deep e.g /latest is OK but /latest/somesensorid fails !!
    router.get('/:endpoint', function(req, res, next) {
        var endpoint = '/api/' + req.params.endpoint;
        console.log("looking for logs for endpoint:: " + endpoint);
        db.find({'req.url': endpoint}, function (err, documents) {
          if (err) {
            console.log("[Error]:: /log/" + endpoint);
            res.status(500).send({status:500,error:err});
          }

          if(documents.length === 0) {
            res.status(404).send({status:404,error:"No documents not found."});
          } else {
            res.send(documents);
          }
        });
    });
    
    return router;

};