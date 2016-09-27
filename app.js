const express = require('express'),
      app = express(),
      cors = require('cors'),
      cfenv = require('cfenv'),
      appEnv = cfenv.getAppEnv(),
      rediscredentials = require('./lib/credentials.js').getCredentials(/compose-for-redis/, 'REDIS_URL'),
      etcdcredentials = require('./lib/credentials.js').getCredentials(/compose-for-etcd/, 'ETCD_URL'),
      isloggedin = require('./lib/isloggedin.js'),
      compression = require('compression'),
      missing = require('./lib/utility.js').missing,
      _ = require('underscore'),
      handleRes = require('./lib/utility.js').handleRes,
      path = require('path');

// socket.io and express config
var http = require('http').Server(app);
var io = require('socket.io')(http);


// App Globals
app.locals = {
  discovery: {
    active: etcdcredentials ? true : false, 
    credentials: etcdcredentials
  },
  cache: {
    type: (rediscredentials ? "redis" : "inmemory" ),
    credentials: rediscredentials || {}
  }
};

if (app.locals.discovery.active) {
  // register with SOS
  var sos = require('./lib/registry.js')(app.locals.discovery);
  sos.register("search", "cache-service", { 
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
  Stats
  Getting cache stats for front-end
*******/
const getStats = function() {
  app.get("cache").info(function(err, data) {
    
    if (!err && data) {
      io.emit("update", data)
    }

  })
}
getStats();
setInterval(getStats, 10000);
io.on('connection', getStats)

/*******
  UI
  Everything Below here is the HTML UI
*******/

// Homepage
app.get('/', isloggedin.auth, function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
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
    getStats();
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
    getStats();
    return handleRes(err, data, req, res)
  })

});

// kill all keys
app.post('/clearall', isloggedin.auth, function(req, res) {

  app.get("cache").clearAll();
  getStats();
  return res.send({ success: true, data: {} })

});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
http.listen(appEnv.port, appEnv.bind, function() {

  // print a message when the server starts listening
  console.log("Server starting on " + appEnv.url);

});

require("cf-deployment-tracker-client").track();