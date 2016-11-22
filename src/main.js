var express = require("express");
var bodyParser = require("body-parser");
var databox_directory = require("./utils/databox_directory.js");

var timeseriesRouter = require('./timeseries.js');
var keyValueRouter = require('./keyvalue.js');
var actuateRouter = require('./actuate.js');
var hypercat = require('./hypercat.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var DATABOX_LOCAL_NAME = process.env.DATABOX_LOCAL_NAME || "databox-store-blob";

//TODO app.use(Macaroon checker);

app.get("/status", function(req, res) {
    res.send("active");
});
app.get("/api/status", function(req, res) {
    res.send("active");
});

app.use('/api/actuate',actuateRouter(app));

app.use('/:var(api/data|api/ts)?',timeseriesRouter(app));

app.use('/api/key',keyValueRouter(app));

app.use('/api/cat',hypercat(app));



//Websocket connection to live stream data
var server = require('http').createServer(app);
var WebSocketServer = require('ws').Server
app.wss = new WebSocketServer({ server: server })
app.broadcastDataOverWebSocket = require('./broadcastDataOverWebSocket.js')(app)


/*databox_directory.register_datastore(DATABOX_LOCAL_NAME, ':8080/api')
  .then( (ids)=>{
	   server.listen(8080);
  })
  .catch((err) => {
  	console.log(err)
  });*/

server.listen(8080);
module.exports = app;