module.exports = function(opts) {

	var cache = null;

	switch (opts.type) {

		case "redis":
			console.log(`Using Redis on ${opts.credentials.hostname}`)
			cache = require('./rediscache.js')(opts.credentials);
			break;

		case "inmemory":
		default:
			console.log(`Using In Memory Cache`)
			cache = require('./inmemorycache.js');
			break;

	}

	return cache;

}