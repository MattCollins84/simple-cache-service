# simple-cache-service

A simple Node.js app that uses an optional attached Redis](http://redis.io/) database to provide a simple key/value cache service, via an HTTP API.

If no Redis database is provided, then data will be cached in memory but this is not recommended for large datasets.

## Running the app on Bluemix

To come...

## Running the app locally

Clone this repository then run `npm install` to add the Node.js libraries required to run the app.

To enable caching via Redis, you will also need to have access to a [Redis](http://redis.io/) server (either running locally, or elsewhere).

You will then need to set some environemt variables to tell the Simple Cache Service how to connect to your Redis server:

* `export SCS_REDIS_HOST='127.0.0.1:6379'` - This is required, but does not have to be localhost
* `export SCS_REDIS_PASSWORD='redis_password'` - This is not required, depends on your Redis server

Then run:

```sh
node app.js
```

## API

The app exposes a simple HTTP API to allow the manipulation of keys/values that are cached.

### POST /key/:key

To set a key, make a request to `POST /key/yourkeyname` and provide the value in the request body, as shown below:

```shell
curl -x POST http://cache.example.com/key/foo -d'value=bar'
```

This will return a JSON response:

```json
{
  "success": true,
  "data": "OK"
}
```

Keys will persist for an hour, and then expire.

### GET /key/:key

To get a key, make a request to `GET /key/yourkeyname`.

```shell
curl -x GET http://cache.example.com/key/foo
```

This will return a JSON response:

```json
{
  "success": true,
  "data": "bar"
}
```

### DELETE /key/:key

To delete a key, make a request to `DELETE /key/yourkeyname`.

```shell
curl -x DELETE http://cache.example.com/key/foo
```

### Remove all keys

To delete all keys, make a request to `POST /clearall`

```shell
curl -x POST http://cache.example.com/clearall
```

## Service Registry

The Service Registry allows the Simple Cache Service to be utilised by the [Simple Search Service](https://github.com/ibm-cds-labs/simple-search-service) to implement caching of searches. This is achieved by using the [Simple Service Registry](https://github.com/mattcollins84/simple-service-registry) module.

### Enabling the Service Registry

Enabling the Service Registry mode requires setting an environment variable, `ETCD_URL`. This should be the URL of your Etcd instance including any basic HTTP authentication information

```
export ETCD_URL='http://username:password@etcd.exmple.com'
```

If the Service Registry is enabled, the Simple Cache Service will become discoverable by the Simple Search Service.

## Contributing

The projected is released under the Apache-2.0 license so forks, issues and pull requests are very welcome.