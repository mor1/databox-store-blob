var app = require("../src/main.js");
var supertest = require("supertest")(app);
var assert = require('assert');


describe('Add and retrieve latest TS values', function() {
	it("Adds records posted to /write/ts", function(done) {
		var data = {
	    	"data": 42,
		}; 
		supertest
			.post("/write/ts/"+11)
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, 42);
				done();
			});
	});

	it("retrieves latest records with /read/ts/latest", function(done) {
		var data = {
		}; 
		supertest
			.post("/read/ts/latest/"+11)
			.send(data)
			.expect(200)
			.end(function(err,result){
				if(err) {
					assert.fail("","",err);
					done();
					return
				}
				assert.deepEqual(result.body[0].data, 42);
				done();
			});
	});
});
