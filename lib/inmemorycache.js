// parse BlueMix  configuration from environment variables, if present
var thecache = {};
var LIFETIME = 1000 * 60 * 60; // 1 hour

var timestamp = function () {
  return new Date().getTime();
};

var purge = function() {
  for (var i in thecache) {
    var now = timestamp();
    var obj = thecache[i];
    if (obj._ts <= now) {
      delete thecache[i];
    }
  }
};

setInterval(purge, 1000 * 60);

// put a new key/value pair in cache. 'value' is a JS object
var put = function(key, value, callback) {
  console.log(`Setting ${key} in Memory...`)
  thecache[key] = {
    value: value,
    _ts: timestamp() + LIFETIME
  }
  callback(null,value);
};

var get = function(key, callback) {

  if (typeof thecache[key] != "undefined") {
    var now = timestamp();
    var obj = thecache[key].value;
    var ts = thecache[key]._ts;

    if (ts >= now) {
      console.log(`Getting ${key} from Memory`)
      callback(null, thecache[key].value)
    } else {
      console.log(`Failed to get ${key} from Memory`)
      delete thecache[key];
      callback(null, null)
    }
  } else {
    console.log(`Failed to get ${key} from Memory`)
    callback(true, null);
  }
};

var remove = function(key, callback) {
  delete thecache[key]
  callback(null, null);
};

var clearAll = function() {
  thecache = {};
}

var info = function(callback) {
  purge();
  var obj = {
    keys: Object.keys(thecache).length,
    memory: 0
  }
  return callback(null, obj)
}
 
module.exports =  {
  get: get,
  put: put,
  remove: remove,
  clearAll: clearAll,
  info: info
};