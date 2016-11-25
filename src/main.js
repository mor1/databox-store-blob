
var https = require('https');
var express = require("express");
var bodyParser = require("body-parser");

var timeseriesRouter = require('./timeseries.js');
var keyValueRouter = require('./keyvalue.js');
var actuateRouter = require('./actuate.js');
var hypercat = require('./hypercat.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var DATABOX_LOCAL_NAME = process.env.DATABOX_LOCAL_NAME || "databox-store-blob";

var HTTPS_CLIENT_CERT = process.env.HTTPS_CLIENT_CERT || '';
var HTTPS_CLIENT_PRIVATE_KEY = process.env.HTTPS_CLIENT_PRIVATE_KEY || '';
var credentials = {
	key:  HTTPS_CLIENT_PRIVATE_KEY,
	cert: HTTPS_CLIENT_CERT,
};



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
var server = https.createServer(credentials,app);
var WebSocketServer = require('ws').Server;
app.wss = new WebSocketServer({ server: server });
app.broadcastDataOverWebSocket = require('./broadcastDataOverWebSocket.js')(app);

server.listen(8080);
module.exports = app;