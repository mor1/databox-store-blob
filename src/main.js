var express = require("express");
var bodyParser = require("body-parser");
var databox_directory = require("./utils/databox_directory.js");
var request = require('request'); 

var timeseriesRouter = require('./timeseries.js');
var keyValueRouter = require('./keyvalue.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//TODO app.use(Macaroon checker);


app.get("/status", function(req, res) {
    res.send("active");
});

app.post('/api/actuate', function(req, res, next) {
    var actuator_id = req.body.actuator_id;     
    databox_directory.get_driver_hostname_from_actuator_id(actuator_id)
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
    .catch((err)=>{ console.log('[ERROR] /actuate ', err); res.send(error);})
});

app.use('/api/data',timeseriesRouter(app));

app.use('/api/key',keyValueRouter(app));



//Websocket connection to live stream data
var server = require('http').createServer(app);
var WebSocketServer = require('ws').Server
app.wss = new WebSocketServer({ server: server })
app.broadcastDataOverWebSocket = require('./broadcastDataOverWebSocket.js')(app)


databox_directory.register_datastore('databox-store-blob', ':8080/api')
  .then( (ids)=>{
	   server.listen(8080);
  })
  .catch((err) => {
  	console.log(err)
  });

 module.exports = app;

