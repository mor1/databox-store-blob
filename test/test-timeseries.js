var app = require("../src/main.js");
var supertest = require("supertest")(app);
var assert = require('assert');


describe('Add and retrieve latest TS values', function() {
	it("Adds records posted to /api/data", function(done) {
		var data = {
	    	"data": 42,
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, 42);
				done()
			});
	})

	it("retrieves latest records with /api/data/latest", function(done) {
		var data = {
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data/latest")
			.send(data)
			.expect(200)
			.end(function(err,result){
				if(err) {
					assert.fail("","",err);
					done()
					return
				}
				assert.deepEqual(result.body[0].data, 42);
				done();
			});
	});
});

describe('Checks add and retrieve latest with more docs', function() {
	it("Adds records posted to /api/data", function(done) {
		var data = {
	    	"data": 99,
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data,99);
				done()
			});
	})

	it("retrieves latest records with /data/latest", function(done) {
		var data = {
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data/latest")
			.send(data)
			.expect(200)
			.end(function(err,result){
				if(err) {
					assert.fail("","",err);
					done()
				}
				assert.deepEqual(result.body[0].data, 99);
				done();
			});
	});

	it("Adds records posted to /api/data", function(done) {
		var data = {
	    	"data": 101,
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, 101);
				done()
			});
	})

	it("Adds records posted to /api/data", function(done) {
		var data = {
	    	"data": 102,
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, 102);
				done()
			});
	})

	it("retrieves latest records with /api/data/latest", function(done) {
		var data = {
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/api/data/latest")
			.send(data)
			.expect(200)
			.end(function(err,result){
				if(err) {
					assert.fail("","",err);
					done();
					return
				}
				assert.deepEqual(result.body[0].data, 102);
				done();
			});
	});
});