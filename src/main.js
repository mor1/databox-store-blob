
var https = require('https');
var express = require("express");
var bodyParser = require("body-parser");

// A request wrapper that inserts the container mangers root cert and
// arbiter api key into GET and POST requests
var request = require('./lib/databox-request/databox-request.js')();

var macaroons = require('macaroons.js');

var timeseriesRouter = require('./timeseries.js');
var keyValueRouter = require('./keyvalue.js');
var actuateRouter = require('./actuate.js');
var hypercat = require('./lib/hypercat/hypercat.js');

const DATABOX_LOCAL_NAME = process.env.DATABOX_LOCAL_NAME || "databox-store-blob";

const DATABOX_ARBITER_ENDPOINT = process.env.DATABOX_ARBITER_ENDPOINT || "https://databox-arbiter:8080" 

//HTTPS certs georated by the container mangers for this components HTTPS server.
const HTTPS_CLIENT_CERT = process.env.HTTPS_CLIENT_CERT || '';
const HTTPS_CLIENT_PRIVATE_KEY = process.env.HTTPS_CLIENT_PRIVATE_KEY || '';
const credentials = {
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
var logsDb = require('./lib/log/databox-log-db.js')('../database/datastoreLOG.db');
var databoxLoggerApi = require('./lib/log/databox-log-api.js');
var databoxLogger = require('./lib/log/databox-log-middelware.js')(logsDb);
app.use(databoxLogger);


//Macaroon checker TODO move this into a module?
app.use(function (req, res, next) {
    var mac = null
    if('macaroon' in req.body) {
      mac = req.body.macaroon;
      delete req.body.macaroon
    } else if ('macaroon' in req.query) {
      mac = req.query.macaroon;
      delete req.query.macaroon
    } else {
      res.status(400).send('Missing macaroon');
      return
    }

    macaroon = macaroons.MacaroonsBuilder.deserialize(mac);
    req.macaroon = new macaroons.MacaroonsVerifier(macaroon).satisfyExact("target = " + DATABOX_LOCAL_NAME);

    next();
})

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

app.use('/logs',databoxLoggerApi(app,logsDb));



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
app.broadcastDataOverWebSocket = require('./lib/websockets/broadcastDataOverWebSocket.js')(app);


//Register with arbiter and get secret
app.arbiterSecret = null;

request.get(DATABOX_ARBITER_ENDPOINT+'/store/secret')
    .then((error, response, body) => {
        console.log(error,response,body)
        app.arbiterSecret = Buffer.from(body,'base64');

        server.listen(8080,function() {
                console.log("listening on 8080");
            });
    })
    .catch((error)=>{
        console.log(error);
        throw new Error(error);
    });


module.exports = app;