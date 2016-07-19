const getCredentials = function(service) {
  
  /****
    VCAP_SERVICES
    This is Bluemix
  ****/
  if (typeof process.env.VCAP_SERVICES === 'string') {
    console.log("Using Bluemix config")
    var services = {}
  }

  // Not Bluemix, so create empty services object
  else {
    var services = {};
  }

  // REDIS_URL
  // This is local configuration
  // append to existing services
  if (typeof process.env.SCS_REDIS_HOST === 'string') {
  console.log("Using local config for Redis")
  services["user-provided"] = [
    {
      name: "Redis by Compose",
      credentials: {
        public_hostname: process.env.SCS_REDIS_HOST,
        password: process.env.SCS_REDIS_PASSWORD || null
      }
        
    }
  ]

}

  // Find required service
  for(var i in services["user-provided"]) {
    if (services["user-provided"][i].name.match(service)) {
      return services["user-provided"][i].credentials;
    }
  }
  return null;
};

module.exports = {
  getCredentials: getCredentials
}