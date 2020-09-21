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

// Express modules
const express = require('express');
const createError = require('http-errors');
// const bodyParser = require('body-parser')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const params = require('./params');

// Router endpoints
const indexRouter = require('./routes/indexRouter');
const usersRouter = require('./routes/usersRouter');


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


// -------------------------------
// Application
// -------------------------------
const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);


// -------------------------------
// Error Handlers
// -------------------------------

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Body parser
// app.use(bodyParser.json())
// app.use(
//     bodyParser.urlencoded({
//       extended: true,
//     })
// )

app.listen(params.port, () => {
  console.log(`MLP app running on port ${params.port}.`)
})


// Expose app modules
module.exports = app;
