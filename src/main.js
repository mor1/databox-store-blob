
var https = require('https');
var express = require("express");
var bodyParser = require("body-parser");
var macaroons = require('macaroons.js');
var macaroonVerifier = require('./macaroon-verifier.js');

// A request wrapper that inserts the container mangers root cert and
// arbiter api key into GET and POST requests
var request = require('./lib/databox-request/databox-request.js')();

const DATABOX_LOCAL_NAME = process.env.DATABOX_LOCAL_NAME || "databox-store-blob";

const DATABOX_ARBITER_ENDPOINT = process.env.DATABOX_ARBITER_ENDPOINT || "https://databox-arbiter:8080" 

//HTTPS certs created by the container mangers for this components HTTPS server.
const HTTPS_CLIENT_CERT = process.env.HTTPS_CLIENT_CERT || '';
const HTTPS_CLIENT_PRIVATE_KEY = process.env.HTTPS_CLIENT_PRIVATE_KEY || '';
const credentials = {
	key:  HTTPS_CLIENT_PRIVATE_KEY,
	cert: HTTPS_CLIENT_CERT,
};


// TODO: Refactor token to key here and in CM to avoid confusion with bearer tokens
var ARBITER_KEY = process.env.ARBITER_TOKEN;
var NO_SECURITY = !!process.env.NO_SECURITY;

//ENDPOINTs
var timeseriesRouter = require('./timeseries.js');
var keyValueRouter = require('./keyvalue.js');
var actuateRouter = require('./actuate.js');
var hypercat = require('./lib/hypercat/hypercat.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/*
* DATABOX API Logging
* Logs all requests and responses to/from the API in bunyan format in nedb
*/
var logsDb = require('./lib/log/databox-log-db.js')('../database/datastoreLOG.db');
var databoxLoggerApi = require('./lib/log/databox-log-api.js');
var databoxLogger = require('./lib/log/databox-log-middelware.js')(logsDb);
app.use(databoxLogger);

var server = null;
if(credentials.cert === '' || credentials.key === '') {
    var http = require('http');
    console.log("WARNING NO HTTPS credentials supplied running in http mode!!!!");
    server = http.createServer(app);
} else {
    server = https.createServer(credentials,app);
}

app.get("/status", function(req, res) {
    res.send("active");

});

app.get("/api/status", function(req, res) {
    res.send("active");
});

app.use('/api/cat',hypercat(app));

app.use('/logs',databoxLoggerApi(app,logsDb));

app.use('/api/actuate',actuateRouter(app));

app.use('/:var(api/data|api/ts)?',timeseriesRouter(app));

app.use('/api/key',keyValueRouter(app));

//Register with arbiter and get secret
macaroonVerifier.getSecretFromArbiter(ARBITER_KEY)

	.then((secret) => {
		// TODO: Clean up

		if (!NO_SECURITY)
			app.use(macaroonVerifier.verifier(secret, DATABOX_LOCAL_NAME));		

	})

	.then((ids) => {
		//Websocket connection to live stream data
        var WebSocketServer = require('ws').Server;
        app.wss = new WebSocketServer({ server: server, verifyClient: macaroonVerifier.wsVerifier(secret, DATABOX_LOCAL_NAME) });
        app.broadcastDataOverWebSocket = require('./lib/websockets/broadcastDataOverWebSocket.js')(app);

		server.listen(8080, function () {
            console.log("listening on port 8080");
        });
	})

	.catch((err) => {
		console.log(err);
	});


module.exports = app;
