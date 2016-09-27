var url = require('url');

const getCredentials = function(service, env) {
  console.log('looking for ',service, env);
  // REDIS_URL
  // This is local configuration
  // append to existing services
  if (typeof process.env[env] === 'string') {
    return url.parse(process.env[env]);
  }

  // Find required service
  if (typeof process.env.VCAP_SERVICES === 'string') {
    var services = JSON.parse(process.env.VCAP_SERVICES);
    for(var i in services) {
      if (i.match(service)) {
        var s = services[i][0];
        return url.parse(s.credentials.uri);
      }
    }
  }
  return null;
};

module.exports = {
  getCredentials: getCredentials
}