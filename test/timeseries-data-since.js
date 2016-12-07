var app = require("../src/main.js");
app.locals.debug = true;
var supertest = require("supertest")(app);
var assert = require('assert');


var recordSet = []; // store res from can POST /data/since to test /data/range

describe('tests /read/ts/since', function() {
	var data = {
	    	"data": {new:"data", since:"world"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
	var lastRecord = {};
	
	it("Adds records posted to /write/ts", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/write/ts/"+11)
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world"});
				done()
			});
	});

	it('can get lastRecord',function(done){
		supertest
				.post("/read/ts/latest/"+11)
				.send(data)
				.expect(200)
				.end(function(err,result){
					if(err) {
						assert.fail("","",err);
						done();
					}
					assert.deepEqual(result.body[0].data, {test:"data", hello:"world"});
					lastRecord = result.body[0];
					done();
					console.log(lastRecord.timestamp);
				});
	});

	it("Adds records posted to /write/ts", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/write/ts/"+11)
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world"});
				done();
			});
	});

	it("Adds records posted to /write/ts/", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world0"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/write/ts/"+11)
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world0"});
				done();
			});
	});

	it("Adds records posted to /write/ts/", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world1"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/write/ts/"+11)
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world1"});
				done();
			});
	});

	it("Adds records posted to /write/ts/", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world2"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/write/ts/"+11)
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world2"});
				done();
			});
	});

	it("Adds records posted to /write/ts/", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world3"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/write/ts/"+11)
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world3"});
				done();
			});
	});

	it("Adds records posted to /write/ts/", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world4"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/write/ts/"+11)
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world4"});
				done();
			});
	});

	it('can POST /read/ts/since ' + lastRecord.timestamp  + ' and returns 6 items',function(done){
		
		data = {
					"timestamp": lastRecord.timestamp,
					"sensor_id": 11
				};

		supertest
				.post("/read/ts/since/"+11)
				.send(data)
				.expect(200)
				.end(function(err,result){
					if(err) {
						assert.fail("","",err);
						done();
					}
					assert.equal(result.body.length, 6);
					recordSet = result.body;
					done();
				});
	});

});

describe('tests /read/ts/range', function() {
	
		it('can POST /read/ts/range and retrieve data ',function(done){
		
			var data = {
	    	"start": recordSet[1].timestamp,
	    	"end": recordSet[4].timestamp,
	    	"sensor_id": 11,
	    	"vendor_id": 1
			}; 

			supertest
					.post("/read/ts/range/"+11)
					.send(data)
					.expect(200)
					.end(function(err,result){
						if(err) {
							assert.fail("","",err);
							done();
						}
						assert.equal(result.body.length, 4);
						recordSet = result.body;
						done();
					});
		});
});