/*!
 * MLP.Core.Tests
 * File: /test/index.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

const request = require('supertest');
const express = require('express');
const http = require('http')
const path = require('path');
const utils = require('../lib');
const error = require('../error')
const config = require('../config');
const sessionTests = require('./sessions')


/**
 * Initialize main Express instance.
 */

const app = express();

/**
 * Use port 5000 for unit testing.
 *
 */
const port = 5000
app.set('port', port);

/**
 * Create HTTP server
 */
const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces
 */
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/**
 * Event listener for HTTP server "error" event
 */
function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event
 */
function onListening () {
  const addr = server.address()
  const uri = typeof addr === 'string' ? addr : `http://localhost:${addr.port}`
  console.log(`Listening on ${uri}\n\n\n`)
}


/**
 * Add routes
 */
app.get('/', function (req, res) {
  res.send("Unit Tests")
})

// Sessions tests
app.get('/sessions', function (req, res) {
  sessionTests.run('delete_session', 1000)
  sessionTests.run('set_session', 2000)
  let result = sessionTests.run('get_session', 6000)
  res.json(result)

});


// test sessions services
request(app)
    .get('/sessions')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      // console.log(res)
      if (err) throw err;
    });

module.exports = app;

