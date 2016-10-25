var express = require("express");
var bodyParser = require("body-parser");
var databox_directory = require("./utils/databox_directory.js");

var timeseriesRouter = require('./timeseries.js');
var keyValueRouter = require('./key-valuer-router.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//TODO app.use(Macaroon checker);


app.get("/status", function(req, res) {
    res.send("active");
});

app.use('/api/data',timeseriesRouter(app));

app.use('/api/key',keyValueRouter(app));



//Websocket connection to live stream data
var server = require('http').createServer(app);
var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ server: server })

var connectionsBySensorId = {};

wss.on('connection', function connection(ws) {
 
 //TODO Macaroon check 
 
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
	//TODO define msg format 
	try {
		var msg = JSON.parse(message);
		console.log(msg);
		//TODO Check For Macaroon  
		
		if('sensor_id' in msg) {
			//TODO Use Macaroon to ensure app can access sensor id 

			var sensor_id = msg.sensor_id;
			if(!(msg.sensor_id in connectionsBySensorId)) {
				connectionsBySensorId[sensor_id] = [];
			} 
			connectionsBySensorId[sensor_id].push(ws);
			ws.send('Registered for messages for sensor_id:' + sensor_id);
		} else {
			ws.send('Missing sensor_id');
		}
	} catch (e) {
		ws.send('Invalid message format', e.toString());
	}
  });
 
  ws.send('ack');
});

app.broadcastDataOverWebSocket = function (sensor_id, data) {
	//console.log("broadcastDataOverWebSocket",sensor_id, data);
	if(sensor_id in connectionsBySensorId) {
		connectionsBySensorId[sensor_id].map((val,ind,arr)=>{
			
			val.send(JSON.stringify(data));
		});
	}
};


server.listen(8080);

databox_directory.register_datastore('databox-store-blob', ':8080/api')
  .then( (ids)=>{
	   server.listen(8080);
  })
  .catch((err) => {
  	console.log(err)
  });

 module.exports = app;

