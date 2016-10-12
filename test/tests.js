var app = require("../src/main.js");
var supertest = require("supertest")(app);
var assert = require('assert');


it("Responds with 'active'", function(done) {
    supertest
        .get("/status")
        .expect(200)
        .expect("active",done);
});

describe('Add and retrieve latest', function() {
	it("Adds records posted to /data", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world"});
				done()
			});
	})

	it("retrieves latest records with /data/latest", function(done) {
		var data = {
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/data/latest")
			.send(data)
			.expect(200)
			.end(function(err,result){
				if(err) {
					assert.fail("","",err);
					done()
					return
				}
				assert.deepEqual(result.body[0].data, {test:"data", hello:"world"});
				done();
			});
	});
});

describe('Checks add and retrieve latest with more docs', function() {
	it("Adds records posted to /data", function(done) {
		var data = {
	    	"data": {test:"data", goodby:"world"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", goodby:"world"});
				done()
			});
	})

	it("retrieves latest records with /data/latest", function(done) {
		var data = {
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/data/latest")
			.send(data)
			.expect(200)
			.end(function(err,result){
				if(err) {
					assert.fail("","",err);
					done()
				}
				assert.deepEqual(result.body[0].data, {test:"data", goodby:"world"});
				done();
			});
	});

	it("Adds records posted to /data", function(done) {
		var data = {
	    	"data": {test:"testing", goodby:"world"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"testing", goodby:"world"});
				done()
			});
	})

	it("Adds records posted to /data", function(done) {
		var data = {
	    	"data": {test:"testing", goodby:"cruel world"},
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/data")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"testing", goodby:"cruel world"});
				done()
			});
	})

	it("retrieves latest records with /data/latest", function(done) {
		var data = {
	    	"sensor_id": 11,
	    	"vendor_id": 1
		}; 
		supertest
			.post("/data/latest")
			.send(data)
			.expect(200)
			.end(function(err,result){
				if(err) {
					assert.fail("","",err);
					done();
					return
				}
				assert.deepEqual(result.body[0].data, {test:"testing", goodby:"cruel world"});
				done();
			});
	});
});
