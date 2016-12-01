

module.exports = function () {
  
  var request = require('request');
  var https = require('https');

  const ARBITER_TOKEN   = process.env.ARBITER_TOKEN;

  const CM_HTTPS_CA_ROOT_CERT = process.env.CM_HTTPS_CA_ROOT_CERT || '';
  
  var agentOptions = {};
  
  if(CM_HTTPS_CA_ROOT_CERT === '') {
    console.log("WARNING[databox-request]:: no https root cert provided not checking https certs.");
    agentOptions.rejectUnauthorized = false;
  } else {
     agentOptions.ca = CM_HTTPS_CA_ROOT_CERT;
  }

  var httpsAgent = new https.Agent(agentOptions);

  var databoxRequest = {};

  databoxRequest.get = function (url,options) {
    return new Promise((resolve, reject) => {
      console.log("GETTING::", url);
      opt = options || {};
      opt.url = url;
      opt.method = 'GET';
      opt.agent = httpsAgent;

      request(opt,function(error, response, body){


          if(error !== null) {
            reject({error:error, response:response, body:body});
            return;
          } else if (response.statusCode != 200) {
            reject({error:body, response:response, body:body});
            return;
          } 
          
          resolve({error:error, response:response, body:body});
          
        });
    });
  };

  databoxRequest.post = function (url,options) {
    return new Promise((resolve, reject) => {
      opt = options || {};
      opt.url = url;
      opt.method = 'POST';
      opt.agent = httpsAgent;

      request(opt,function(error, response, body){
          if(error !== null) {
            reject({error:error, response:response, body:body});
            return;
          } else if (response.statusCode != 200) {
            reject({error:body, response:response, body:body});
            return;
         }  
         resolve({error:error, response:response, body:body});
        });
    });
  };

  return databoxRequest;
  
};