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
const builder = require('./views/builder')

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
  sess.messages = sess.messages || [];
  sess.messages.push(builder.messages.create(e));
  if (e) console.log('Message sent:\n%s', e);
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

// define view parameters
app.use(function(req, res, next) {
  // Add boilerplate content
  req.view = params.settings.general;

  // response messages
  req.view.messages = req.session.messages || []

  // navigation menus
  req.view.menus = {
    breadcrumb: builder.nav.buildBreadcrumbMenu(req.originalUrl),
    user: builder.nav.buildUserMenu(req.session.user),
    editor: builder.nav.buildEditorMenu(req.session.user, req)
  }

  // user-specific request/session parameters
  req.user = req.session.user || null;

  next();
});



// map routes -> controllers
require('./routes')(app, { verbose: true });

// restrict user permissions by role
app.use(function (req, res, next) {
  console.log('RESTRICT', next, req.session.user);
  // if (req.session.user ||
  //     (req.method === 'GET' && req.url === '/login') ||
  //     (req.method === 'GET' && req.url === '/register'))
  // {
  //   next();
  // } else {
  //   res.message(null, 'restricted', 'error');
  //   res.redirect('/');
  // }
  next();
});

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