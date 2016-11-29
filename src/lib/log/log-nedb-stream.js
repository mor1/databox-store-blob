
module.exports = function (options) {

    var stream = require('stream');
    var util = require('util');
    var Writable = stream.Writable;
    var Datastore = require('nedb');
    var db = new Datastore({filename: '../database/datastoreLOG.db', autoload: true});
    db.ensureIndex({fieldName: 'req_id', unique: false});

    if (!options) {
        options = {};
    }

    // the LogStream constructor.
    function LogStream(options) {
        Writable.call(this, options);
    }

    util.inherits(LogStream, Writable);

    LogStream.prototype._write = function (chunk, enc, cb) {

        data = JSON.parse(chunk.toString());

        db.insert(data, function (err, doc) {
            if (err) {
                console.log("[Error]:: /log/", err, doc);
            }
            return cb();
        });
    };


    return new LogStream(options);
};