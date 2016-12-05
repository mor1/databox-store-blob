const https = require('https');
const express = require("express");
const bodyParser = require("body-parser");
const WebSocketServer = require('ws').Server;

const hypercat = require('./lib/hypercat/hypercat.js');
const macaroonVerifier = require('./lib/macaroon/macaroon-verifier.js');
const SubscriptionManager = require('./lib/subscription/subscriptionManager.js');
const timeseries = require('./timeseries.js');
const keyvalue   = require('./keyvalue.js');

const DATABOX_LOCAL_NAME = process.env.DATABOX_LOCAL_NAME || "databox-store-blob";
const DATABOX_ARBITER_ENDPOINT = process.env.DATABOX_ARBITER_ENDPOINT || "https://databox-arbiter:8080" 
// TODO: Refactor token to key here and in CM to avoid confusion with bearer tokens
const ARBITER_KEY = process.env.ARBITER_TOKEN;
const NO_SECURITY = !!process.env.NO_SECURITY;

//HTTPS certs created by the container mangers for this components HTTPS server.
const HTTPS_CLIENT_CERT = process.env.HTTPS_CLIENT_CERT || '';
const HTTPS_CLIENT_PRIVATE_KEY = process.env.HTTPS_CLIENT_PRIVATE_KEY || '';
const credentials = {
	key:  HTTPS_CLIENT_PRIVATE_KEY,
	cert: HTTPS_CLIENT_CERT,
};

const app = express();

//Register with arbiter and get secret
macaroonVerifier.getSecretFromArbiter(ARBITER_KEY)
	.then((secret) => {
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended: true}));

		app.get("/status", () => res.send("active"));

		var wsVerifier;
		if (!NO_SECURITY) {
			//everything after here will require a valid macaroon
			app.use(macaroonVerifier.verifier(secret, DATABOX_LOCAL_NAME));
			wsVerifier = macaroonVerifier.wsVerifier(secret, DATABOX_LOCAL_NAME);
		}

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

		app.use('/cat', hypercat(app));

		app.use('/logs', databoxLoggerApi(app,logsDb));

		app.use('/read/ts/:sensor',  timeseries.read());
		app.use('/write/ts/:sensor', timeseries.write(subscriptionManager));

		app.use('/read/json/:key',   keyvalue.read());
		app.use('/write/json/:key',  keyvalue.write(subscriptionManager));

		var subscriptionManager = new SubscriptionManager(new WebSocketServer({
			server,
			verifyClient: wsVerifier,
			path: '/ws'
		}));

		app.use('/sub',   subscriptionManager.sub());
		app.use('/unsub', subscriptionManager.unsub());

		server.listen(8080, function () {
			console.log("Listening on port 8080");
		});
	})
	.catch((err) => {
		console.log(err);
	});


module.exports = app;
