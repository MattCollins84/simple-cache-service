# simple-cache-service

A simple Node.js app that uses an optional attached Redis](http://redis.io/) database to provide a simple key/value cache service, via an HTTP API.

If no Redis database is provided, then data will be cached in memory but this is not recommended for large datasets.

## Running the app on Bluemix

1. If you do not already have a Bluemix account, [sign up here][bluemix_signup_url]

2. Download and install the [Cloud Foundry CLI][cloud_foundry_url] tool

3. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/ibm-cds-labs/simple-cache-service.git
  ```

4. `cd` into this newly created directory

5. Open the `manifest.yml` file and change the `host` value to something unique. The host you choose will determinate the subdomain of your application's URL:  `<host>.mybluemix.net`

6. Connect to Bluemix in the command line tool and follow the prompts to log in.

  ```
  $ cf api https://api.ng.bluemix.net
  $ cf login
  ```

7. Create the Compose for Redis service in Bluemix if you haven't already done so.

  **Note :** The Compose for Redis service does not offer a free plan. For details of pricing, see the _Pricing Plans_ section of the [Compose for Redis service][compose_for_redis_url] in Bluemix.

  ```
  $ cf create-service compose-for-redis Standard my-compose-for-redis-service
  ```
  
8. Push the app to Bluemix.

  ```
  $ cf push
  ```

9. Bind the service to the application.

  ```
  $ cf bind-service simple-cache-service my-compose-for-redis-service
  ```

## Running the app locally

Clone this repository then run `npm install` to add the Node.js libraries required to run the app.

To enable caching via Redis, you will also need to have access to a [Redis](http://redis.io/) server (either running locally, or elsewhere).

You will then need to set some environment variables to tell the Simple Cache Service how to connect to your Redis server:

```
export REDIS_URL='redis://localhost:6379'
```

If your Redis is password protected then supply the password in the url:

```
export REDIS_URL='redis://admin:mypassword@localhost:6379'
```

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

## Enabling the Service Registry - Bluemix

1. Create the Compose for Etcd service in Bluemix if you haven't already done so.

  **Note :** The Compose for Etcd service does not offer a free plan. For details of pricing, see the _Pricing Plans_ section of the [Compose for Redis service][compose_for_redis_url] in Bluemix.

  ```
  $ cf create-service compose-for-etcd Standard my-compose-for-etcd-service
  ```

2. Bind the service to the application.

  ```
  $ cf bind-service simple-cache-service my-compose-for-etcd-service
  $ cf restage simple-cache-service
  ``` 

### Enabling the Service Registry - Local Etcd

Enabling the Service Registry mode requires setting an environment variable, `ETCD_URL`. This should be the URL of your Etcd instance including any basic HTTP authentication information

```
export ETCD_URL='http://username:password@etcd.exmple.com'
```

If the Service Registry is enabled, the Simple Cache Service will become discoverable by the Simple Search Service.

## Contributing

The projected is released under the Apache-2.0 license so forks, issues and pull requests are very welcome.

[compose_for_etcd_url]: https://console.ng.bluemix.net/catalog/services/compose-for-etcd/
[bluemix_signup_url]: https://ibm.biz/compose-for-etcd-signup
[cloud_foundry_url]: https://github.com/cloudfoundry/cli
