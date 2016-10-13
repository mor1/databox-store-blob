var app = require("../src/main.js");
app.locals.debug = true;
var supertest = require("supertest")(app);
var assert = require('assert');


var recordSet = []; // store res from can POST /data/since to test /data/range

describe('tests /api/data/since', function() {
	var data = {
	    	"data": {new:"data", since:"world"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
	var lastRecord = {};
	
	it("Adds records posted to /api/data", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world"});
				done()
			});
	});

	it('can get lastRecord',function(done){
		supertest
				.post("/api/data/latest")
				.send(data)
				.expect(200)
				.end(function(err,result){
					if(err) {
						assert.fail("","",err);
						done()
					}
					assert.deepEqual(result.body[0].data, {test:"data", hello:"world"});
					lastRecord = result.body[0]
					done()
					console.log(lastRecord.timestamp);
				});
	});

	it("Adds records posted to /api/data", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world"});
				done()
			});
	});

	it("Adds records posted to /api/data", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world0"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world0"});
				done()
			});
	});

	it("Adds records posted to /api/data", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world1"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world1"});
				done()
			});
	});

	it("Adds records posted to /api/data", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world2"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world2"});
				done()
			});
	});

	it("Adds records posted to /api/data", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world3"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world3"});
				done()
			});
	});

	it("Adds records posted to /api/data", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world4"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world4"});
				done()
			});
	});

	it('can POST /data/since ' + lastRecord.timestamp  + ' and returns 6 items',function(done){
		
		data = {
					"timestamp": lastRecord.timestamp,
					"sensor_id": 11
				};

		supertest
				.post("/api/data/since")
				.send(data)
				.expect(200)
				.end(function(err,result){
					if(err) {
						assert.fail("","",err);
						done()
					}
					assert.equal(result.body.length, 6);
					recordSet = result.body
					done()
				});
	});

});

describe('tests /api/data/range', function() {
	
		it('can POST /api/data/range and retrive data ',function(done){
		
			var data = {
	    	"start": recordSet[1].timestamp,
	    	"end": recordSet[4].timestamp,
	    	"sensor_id": 11,
	    	"vendor_id": 1
			}; 

			supertest
					.post("/api/data/range")
					.send(data)
					.expect(200)
					.end(function(err,result){
						if(err) {
							assert.fail("","",err);
							done()
						}
						assert.equal(result.body.length, 4);
						recordSet = result.body
						done()
					});
		});
});