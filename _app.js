/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------

  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:
  Version:      1.0
  Last Updated: June 15, 2020
  ------------------------------------------------------
  Module:       Core
  Filename:     /app.js
  ======================================================
*/


// -------------------------------
// Initialization
// -------------------------------

// Router endpoints
const indexRouter = require('./routes/indexRouter');
const usersRouter = require('./routes/usersRouter');

// Initialize HTTP server
const http = require('http');
const fs = require('fs');
const url = require('url');
const formidable = require('formidable');

http.createServer(function (req, res) {

  const q = url.parse(req.url, true);
  const filename = q.pathname;

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(indexRouter.router());
  res.write(filename);
  res.end();
}).listen(3000);


// http.createServer(function (req, res) {
//   var q = url.parse(req.url, true);
//   var filename = "." + q.pathname;
//   fs.readFile(filename, function(err, data) {
//     if (err) {
//       res.writeHead(404, {'Content-Type': 'text/html'});
//       return res.end("404 Not Found");
//     }
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write(data);
//     return res.end();
//   });
// }).listen(3000);

//
// const req = https.request(options, res => {
//   console.log(`statusCode: ${res.statusCode}`)
//
//   res.on('data', d => {
//     process.stdout.write(d)
//   })
// })
//
// req.on('error', error => {
//   console.error(error)
// })
//
// req.write(data)
// req.end()

// const server = https.createServer((req, res) => {
//   // we can access HTTP headers
//   req.on('data', chunk => {
//     console.log(`Data chunk available: ${chunk}`)
//   })
//   req.on('end', () => {
//     //end of data
//   })
// })



//
// const req = https.request(options, res => {
//   console.log(`statusCode: ${res.statusCode}`)
//
//   res.on('data', d => {
//     process.stdout.write(d)
//   })
// })
//
// req.on('error', error => {
//   console.error(error)
// })
//
// req.write(data)
// req.end()

// // Load list of Stations
// db.any('SELECT name FROM stations')
//     .then(function (data) {
//         console.log('DATA:', data.value)
//     })
//     .catch(function (error) {
//         console.log('ERROR:', error)
//     })
//
//
// db.any({
//     name: 'find-user',
//     text: 'SELECT name FROM station', // can also be a QueryFile object
//     values: [1]
// })
//     .then(user => {
//         // user found;
//     })
//     .catch(error => {
//         // error;
//     });


