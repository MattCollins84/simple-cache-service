var url = require('url');

//simple orchestration
module.exports = function(discovery) {

  var creds = discovery.credentials;

  // omit the '/v2/keys' bit
  delete creds.pathname;
  delete creds.path;
  var u = url.format(creds);

	return new require('simple-service-registry')({ 
    url: u,
    strictSSL: false
  })

}