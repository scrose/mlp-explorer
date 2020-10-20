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

'use strict';

/**
 * Module dependencies.
 */

const express = require('express');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const menu = require('./views/builder/nav')
const messages = require('./views/builder/messages')

const app = express();

// =====================================
// views engine

// set our default template engine to "ejs"
// which prevents the need for using file extensions
app.set('view engine', 'ejs');

// set views for error and 404 pages
app.set('views', path.join(__dirname, 'views'));


// =====================================
// session support
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'Built in Victoria, BC'
}));

// session-persistent message middleware:
// custom res.message() method  which stores messages in the session
app.response.message = function(e){
  // reference `req.session` via the `this.req` reference
  const sess = this.req.session;
  // simply add the msg to an array for later
  // app.response.message = messages.create(this.req.session);
  sess.messages = sess.messages || [];
  sess.messages.push(messages.buildMessage(e));
  console.log(e);
  return this;
};

// session-persistent message middleware:
// custom res.message() method  which stores messages in the session
app.response.cleanup = function(){
  console.log('Clean up session.')
  const sess = this.req.session;
  sess.messages = [];
  // Important: save session updates
  sess.save()
  return this;
};


// exports.logout=function(req,res){
//
//   sess=req.session;
//   var data = {
//     "Data":""
//   };
//   sess.destroy(function(err) {
//     if(err){
//       data["Data"] = 'Error destroying session';
//       res.json(data);
//     }else{
//       data["Data"] = 'Session destroy successfully';
//       res.json(data);
//       //res.redirect("/login");
//     }
//   });
//
// };


// =====================================
// logger
app.use(logger('dev'));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// parse request bodies (req.body)
app.use(express.urlencoded({ extended: true }))

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'));

// define breadcrumb menu
app.use(function(req, res, next) {
  req.breadcrumbs = menu.get_breadcrumbs(req.originalUrl);
  next();
});

// map routes -> controllers
require('./routes')(app, { verbose: true });

// assume 404 since no middleware responded
app.use(function(req, res, next){
  res.status(404).render('404', { url: req.originalUrl });
});

// assume 5xx for server crash
app.use(function(err, req, res, next){
  // log it
  console.error(err.stack);
  // error page
  res.status(500).render('5xx');
});

module.exports = app;