
var request = require('request'); 
var cat = require('./base-cat.json'); 

var DATABOX_LOCAL_NAME = process.env.DATABOX_LOCAL_NAME || "databox-store-blob";
var PORT = process.env.DATABOX_PORT || 8080;

module.exports = function (expressApp) {

    var router = require('express').Router({mergeParams: true});

    var app = expressApp;
    
    //Add a data source to the current Hypercat catalogue
    router.post('/add/:datasourceid',function(req, res, next) {
        
        var id = req.params.datasourceid;
        var vendor = req.body.vendor;
        var sensortype = req.body.sensor_type;
        var unit = req.body.unit || "";
        var location = req.body.location || "";
        var description = req.body.description || "";
        var isActuator = req.body.isActuator || false;

        console.log("Adding data source to the current Hypercat catalogue", id);

        var item = {
            "item-metadata": [
                {
                    "rel": "urn:X-hypercat:rels:hasDescription:en",
                    "val": description
                },
                {
                    "rel": "urn:X-databox:rels:vendor",
                    "val": vendor
                },
                {
                    "rel": "urn:X-databox:rels:sensortype",
                    "val": sensortype
                },
                {
                    "rel": "urn:X-databox:rels:unit",
                    "val": unit
                },
                {
                    "rel": "urn:X-databox:rels:location",
                    "val": location
                },
                {
                    "rel": "urn:X-databox:rels:datasourceid",
                    "val": id
                },
            ],
            "href": "https://" + DATABOX_LOCAL_NAME + ":" + PORT + "/" 
        };

        if(isActuator) {
            item["item-metadata"].push({
                    "rel": "urn:X-databox:rels:isActuator",
                    "val": true
                });
        }

        cat.items.push(item);

        res.send("OK");
    });

    //Return the current Hypercat catalogue
    router.get('/',function(req, res, next) {
        res.send(cat);
    });

    

    return router;
};