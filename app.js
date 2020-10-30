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
const utils = require('./utilities')

const app = express();

// =====================================
// views engine

// set our default template engine to "ejs"
// which prevents the need for using file extensions
app.set('view engine', 'ejs');

// set views for error and 404 pages
app.set('views', path.join(__dirname, 'views'));


// Proxy setting
app.set('trust proxy', 1) // trust first proxy



// ---------------------------------
// session management
// see documentation: https://github.com/expressjs/session
// ---------------------------------
let sessionStore = utils.session(session)

app.use(session({
  genid: function(req) {
    return utils.secure.genUUID() // use UUIDs for session IDs
  },
  store: new sessionStore(),
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: '0d658f82d0651c19872d331401842823',
  maxAge: utils.date.now.setDate(utils.date.now.getDate() + 1),
  cookie: { secure: true, sameSite: true, maxAge: 86400000 }
}));


// session-persistent message middleware:
app.response.message = function(e){
  this.res.messages = this.res.messages || [];
  this.res.messages.push(builder.messages.create(e));
  let statusCode = (e.code === 'error') ? 400 : 200;
  this.res.status(statusCode).json(e);
  if (e) console.log('Status Message:\n\t%s\n\t%s\n\t%s', e.code, e.severity);
  return this;
};


// session-persistent message middleware:
// custom res.cleanup() method which deletes messages in the session
app.response.cleanup = function(){
  console.log('Clean up messages.')
  this.res.messages = [];
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


// ---------------------------------
// session support
// ---------------------------------
app.use(logger('dev'));


// ---------------------------------
// static routes
// ---------------------------------

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// parse request bodies (req.body)
app.use(express.urlencoded({ extended: true }))

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'));



// ---------------------------------
// view parameters
// ---------------------------------
app.use(function(req, res, next) {
  // Add boilerplate content
  req.view = params.settings.general;

  // response messages
  console.log('Session Messages:', req.session.messages)
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


// ---------------------------------
// map routes -> controllers
// ---------------------------------
require('./routes')(app, { verbose: true });



// ---------------------------------
// restrict user permissions by role
// ---------------------------------
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


// ---------------------------------
// default routes
// ---------------------------------
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