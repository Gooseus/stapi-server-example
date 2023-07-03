# Star Trek API (STAPI) Server

An example of using the Typescript STAPI Client [stapi-client-ts](https://github.com/Gooseus/stapi-client-ts) to make a service that converts the STAPI output to JSONAPI format.

## Installation

```bash
$ git clone https://github.com/Gooseus/stapi-server-example.git
$ cd stapi-server-example
$ npm install 
```

## Usage

Start the server with:

```bash
$ npm run start
```

## API Tests

Tests are done on the server endpoints using [Hurl](https://hurl.dev/docs/installation.html).

Once you have Hurl installed, start the server and then run:

```bash
$ hurl --test tests/animal.hurl
```

or

```bash
$ npm run test
```

Additional tests are a work in progress.
