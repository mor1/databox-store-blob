var app = require("../src/main.js");
var supertest = require("supertest")(app);
var assert = require('assert');

it("Responds with 'active'", function(done) {
    supertest
        .get("/status")
        .expect(200)
        .expect("active",done);
});


describe('Add and retrieve by key', function() {
    
    var data = {test:"data", hello:"world"}; 
    var data2 = {test:"data", hello:"world", goodby:'world'}; 
    var key = Date.now();
	
    it("Handles invalid key posted to /api/key/asdfgfhjkl", function(done) {
		supertest
			.get("/api/key/asdfgfhjkl")
			.expect(404)
			.end((err,result)=>{
				assert.deepEqual(result.body, {status:404,error:"Document not found."});
				done()
			});
	})

    it("Adds records posted to /api/key/:key", function(done) {
		supertest
			.post("/api/key/"+key)
			.send(data)
			.expect(200)
			.end((err,result)=>{
				assert.deepEqual(result.body, data);
				done()
			});
	})

	it("retrieves latest records with /api/key/" + key, function(done) {
		
		supertest
			.get("/api/key/"+key)
			.expect(200)
			.end(function(err,result){
				if(err) {
					assert.fail("","",err);
					done()
					return
				}
				assert.deepEqual(result.body, data);
				done();
			});
	});

    it("Updates records posted to /api/key/:key", function(done) {
		supertest
			.post("/api/key/"+key)
			.send(data2)
			.expect(200)
			.end((err,result)=>{
				assert.deepEqual(result.body, data2);
				done()
			});
	});

    it("retrieves latest records with /api/key/" + key, function(done) {
		
		supertest
			.get("/api/key/"+key)
			.expect(200)
			.end(function(err,result){
				if(err) {
					assert.fail("","",err);
					done()
					return
				}
				assert.deepEqual(result.body, data2);
				done();
			});
	});
});


describe('Add and retrieve lots of stuff by key', function() {
    
    var data = {test:"data", hello:"world"}; 
    var data2 = {test:"data", hello:"world", goodby:'world'}; 
    
    for(var i = 0; i < 500; i++) {
        var key = Date.now();
        
        it("Adds records posted to /api/key/:key", function(done) {
            supertest
                .post("/api/key/"+key)
                .send(data)
                .expect(200)
                .end((err,result)=>{
                    assert.deepEqual(result.body, data);
                    done()
                });
        })

        it("retrieves latest records with /api/key/" + key, function(done) {
            
            supertest
                .get("/api/key/"+key)
                .expect(200)
                .end(function(err,result){
                    if(err) {
                        assert.fail("","",err);
                        done()
                        return
                    }
                    assert.deepEqual(result.body, data);
                    done();
                });
        });
    }
});