# Mapproxinator

This service is responsible to keep the latest mapproxy.yaml accessible.

it is doing it by checking for the last version in provider ('fs'/'db'/'s3') regularly and updates it if needed.

this service has two main modes: Init mode - that acts as init container. side-car mode - that keeps the file updated at all time.

## Configuration

`INIT_MODE` initiation of the service , *default to 'true'*.

When set to 'true', creates the config file and initializes it. retrives mapproxy configuration and upadated time files from the provider.

acts as an init-container.

When set to 'false', starts the server and the process of constantly updating mapproxy.yaml. acts as a side-car container.

`SERVER_PORT` set the server port number , *default to '8080'*

`CONFIG_PROVIDER` **available values: 'fs', 's3' or 'db'.** default fs.

 determined where the mapproxy.yaml file is stored. no default value
 
  **if set to 'fs'** - changes will apply directly 
to yaml file that declared in `MAPPROXY_YAML_FILEPATH`.

 **if set to 's3'** -  changes will directly apply to yaml file that is stored in s3 defined bucket.

 **if set to 'db'** - changes will directly apply to the database.

`UPDATED_TIME_JSON_FILE_PATH` path to file that saves the last update of mapproxy.yaml date.

`YAML_DESTINATION_FILE_PATH` path to mapproxy.yaml file.

`POLL_TIMEOUT_FREQUENCY_MS` time to check wheather mapproxy.yaml has changed, *default to '5000' miliseconds (5min)*

`POLL_TIMEOUT_READINESS_KILL_MAX_RND_SECONDS` readiness kill time, *default to '300'*

`POLL_TIMEOUT_REQUESTS_KILL_SECONDS` *default to '5'*

`POLL_TIMEOUT_AFTER_UPDATE_DELAY_SECONDS` *default to '0.5'*


<br>
<br>

**FS Configuration**

***
if `CONFIG_PROVIDER` is set to 'fs' make sure to declare next envs
***

`FS_YAML_SOURCE_FILE_PATH` set the path to the 'mapproxy.yaml' yaml file, no default value.


<br>
<br>

**S3 Object Storage Configuration**

***
if `CONFIG_PROVIDER` is set to 's3' make sure to declare next envs
***

`S3_ACCESS_KEY_ID` S3 access key, *default to 'minioadmin'*

`S3_SECRET_ACCESS_KEY` S3 secret access key, *default to 'minioadmin'*

`S3_ENDPOINT_URL` S3 endpoint URL, *default to 'http://localhost:9000'*

`S3_BUCKET` S3 bucket name, no default valuenpm

`S3_SSL_ENABLED` S3 enable SSL, *deafult to 'false'*

<br>
<br>

**DB Configuration**

***
if `CONFIG_PROVIDER` is set to 'db' make sure to declare next envs
****

`DB_HOST` set the server host , deafult to 'localhost'

`DB_USER` set the database username, default to 'postgres'

`DB_PASSWORD` set the database password, default to 'postgres'

`DB_NAME` set the database name

`DB_PORT` set the database port, default to 5432

`DB_SSL_ENABLE` set to true if you wished to use database ssl.
default to false

`DB_SSL_REJECT_UNAUTHORIZED` if true, the server certificate is verified against the list of supplied CAs

`DB_SSL_CA` set the path to the CA file

`DB_SSL_KEY` set the path to the KEY file

`DB_SSL_CERT` set the path to the CERT file


## API
Checkout the OpenAPI spec [here](/openapi3.yaml)

## Installation

Install deps with npm

```bash
npm install
```

## Run Locally

Clone the project

```bash

git clone https://link-to-project

```

Go to the project directory

```bash

cd my-project

```

Install dependencies

```bash

npm install

```

Start the server

```bash

npm run start

```

## Running Tests

To run tests, run the following command

```bash

npm run test

```

To only run unit tests:
```bash
npm run test:unit
```

To only run integration tests:
```bash
npm run test:integration
```

