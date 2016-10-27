var app = require("../src/main.js");
var supertest = require("supertest")(app);
var assert = require('assert');

describe('Behavior with invalid/missing prams sensor_id', function(){

	it('checks /data/latest invalid ids', function(done){
		
		var data = {
	    	"sensor_id": 99,
	    	"vendor_id": 99
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
				assert.deepEqual(result.body, []);
				done()
			});
	});

	it('checks /data/latest missing ids', function(done){
		
		var data = {
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
				assert.deepEqual(result.body, []);
				done()
			});
	});

});
