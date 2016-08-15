const express = require('express'),
      app = express(),
      cors = require('cors'),
      cfenv = require('cfenv'),
      appEnv = cfenv.getAppEnv(),
      credentials = require('./lib/credentials.js').getCredentials(/Redis by Compose/),
      isloggedin = require('./lib/isloggedin.js'),
      compression = require('compression'),
      missing = require('./lib/utility.js').missing,
      _ = require('underscore'),
      handleRes = require('./lib/utility.js').handleRes;

// App Globals
app.locals = {
  discovery: ( process.env.ETCD_URL ? true : false ),
  cache: {
    type: ( (credentials && credentials.public_hostname) ? "redis" : "inmemory" ),
    credentials: credentials || {}
  }
}

if (process.env.ETCD_URL) {
  // register with SOS
  var sos = require('./lib/sos.js')();
  sos.register("search", "s-c-s", { 
    url: appEnv.url, 
    name: "Simple Caching Service",
    username: ((process.env.LOCKDOWN && process.env.SCS_LOCKDOWN_USERNAME) ? process.env.SCS_LOCKDOWN_USERNAME : null),
    password: ((process.env.LOCKDOWN && process.env.SCS_LOCKDOWN_PASSWORD) ? process.env.SCS_LOCKDOWN_PASSWORD : null) 
  }, 
  { ttl: 10 });
}

// set our cache
app.set("cache", require('./lib/cache.js')(app.locals.cache))

// Use Passport to provide basic HTTP auth when locked down
const passport = require('passport');
passport.use(isloggedin.passportStrategy());

// posted body parser
const bodyParser = require('body-parser')({extended:true})

// compress all requests
app.use(compression());

/*******
  UI
  Everything Below here is the HTML UI
*******/

// Homepage - list namespaces
app.get('/', isloggedin.auth, function (req, res) {
  res.send({ success: true });
});


/*****
  API
  Endpoints below here are the JSON API
*****/

// set key value
app.post('/key/:key', isloggedin.auth, bodyParser, function(req, res) {

  var errors = missing(req.body, ["value"], false);

  if (errors.length) {
    return res.send({
      success: false,
      error: errors
    })
  }

  app.get("cache").put(req.params.key, req.body.value, function(err, data) {
    return handleRes(err, data, req, res)
  })

});


// get key value
app.get('/key/:key', isloggedin.auth, function(req, res) {

  app.get("cache").get(req.params.key, function(err, data) {
    return handleRes(err, data, req, res)
  })

});

// delete key value
app.delete('/key/:key', isloggedin.auth, function(req, res) {

  app.get("cache").remove(req.params.key, function(err, data) {
    return handleRes(err, data, req, res)
  })

});

// kill all keys
app.post('/clearall', isloggedin.auth, function(req, res) {

  app.get("cache").clearAll();

  return res.send({ success: true, data: {} })

});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {

  // print a message when the server starts listening
  console.log("Server starting on " + appEnv.url);

});

require("cf-deployment-tracker-client").track();