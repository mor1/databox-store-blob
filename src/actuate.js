
var request = require('request'); 

module.exports = function (expressApp) {

    var router = require('express').Router();

    var app = expressApp;

    router.post('/', function(req, res, next) {
    var actuator_id = req.body.actuator_id;     

    //TODO FIX ACTUATION where is the correct driver??

    /*databox_directory.get_driver_hostname_from_actuator_id(actuator_id)
    .then((hostname) =>{
        var options = {
            uri: 'http://'+hostname+':8080/api/actuate',
            method: 'POST',
            json: {
                actuator_id: actuator_id,
                method:req.body.method,
                data:req.body.data
            }
        };
        console.log("Passing through call to /actuate", options);
        request(options, function (error, response, body) {
            if (error) {
                res.send(error);
                return;
            }
            res.send(body);
        });
    })
    .catch((err)=>{ console.log('[ERROR] /actuate ', err); res.send(error);});*/

    });

    return router;
};