
var https = require('https');
var express = require("express");
var bodyParser = require("body-parser");

var timeseriesRouter = require('./timeseries.js');
var keyValueRouter = require('./keyvalue.js');
var actuateRouter = require('./actuate.js');
var hypercat = require('./hypercat.js');

var DATABOX_LOCAL_NAME = process.env.DATABOX_LOCAL_NAME || "databox-store-blob";

var HTTPS_CLIENT_CERT = process.env.HTTPS_CLIENT_CERT || '';
var HTTPS_CLIENT_PRIVATE_KEY = process.env.HTTPS_CLIENT_PRIVATE_KEY || '';
var credentials = {
	key:  HTTPS_CLIENT_PRIVATE_KEY,
	cert: HTTPS_CLIENT_CERT,
};

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/*
* DATABOX API Logging
* Logs all requests and responses to/from the API in bunyan format in nedb
*/
var databoxLogger = require('./lib/log/databox-log-middelware.js');
app.use(databoxLogger());


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




var server = null;
if(credentials.cert === '' || credentials.key === '') {
    var http = require('http');
    console.log("WARNING NO HTTPS credentials supplied running in http mode!!!!");
    server = http.createServer(app);
} else {
    server = https.createServer(credentials,app);
}

//Websocket connection to live stream data
var WebSocketServer = require('ws').Server;
app.wss = new WebSocketServer({ server: server });
app.broadcastDataOverWebSocket = require('./broadcastDataOverWebSocket.js')(app);

server.listen(8080,function() {
    console.log("listening on 8080");
});
module.exports = app;