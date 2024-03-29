#!/usr/bin/env node

/**
 * Module dependencies
 */

import createApp from './src/app.js';
import http from 'http';

/**
 * Server initialization
 */


/**
 * Create new Express app.
 */

let app = createApp();

/**
 * Event listener for HTTP server "listening" event
 */
function onListening () {
    const addr = server.address();
    const uri = typeof addr === 'string' ? addr : `${process.env.API_HOST}`
    console.log(`API Listening on ${uri}`);
}

/**
 * Get port from environment and store in Express
 */

const port = normalizePort(process.env.API_PORT || '3001')
app.set('port', port);

/**
 * Create HTTP server
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
server.timeout = 20000;

/**
 * Normalize a port into a number, string, or false
 */
function normalizePort (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // Named pipe
    return val
  }

  if (port >= 0) {
    // Port number
    return port
  }

  return false;
}

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
 * Event listener for uncaught exceptions
 */

process.on('uncaughtException', function(err) {
    console.error('Fatal Error occurred.', err)
    process.exit(1);
})


