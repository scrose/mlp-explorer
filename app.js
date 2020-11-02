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

const express = require('express');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
const sessionStore = require('./models/sessionStore')
const methodOverride = require('method-override');
const builder = require('./views/builder');
const utils = require('./_utilities');
const params = require('./config');

const app = express();

// hide Express usage
app.disable('x-powered-by');

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

app.use(session({
  genid: function(req) {
    return utils.secure.genUUID() // use UUIDs for session IDs
  },
  store: new sessionStore(),
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: params.session.secret,
  maxAge: utils.date.now.setDate(utils.date.now.getDate() + 1),
  cookie: { secure: true, sameSite: true, maxAge: 86400000 }
}));


// ---------------------------------
// message handling
// ---------------------------------
app.response.success = function (msg) {
    if (msg) {
      this.req.session.messages = this.req.session.messages || [];
      this.req.session.messages.push(
          JSON.stringify({
            div: { attributes: {class: 'msg success'}, textNode: msg }
          })
      );
    }
    return this;
}

// session-persistent message middleware:
// custom res.cleanup() method which deletes messages in the session
app.response.cleanup = function(){
  console.log('Clean up messages.')
  this.req.session.messages = [];
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
  req.view.name = path.parse(req.originalUrl).base;

  // response messages
  // req.session.user = req.user
  // req.session.authenticated = !req.user.anonymous
  console.log('Message Bank: ', req.session.messages)
  req.view.messages = req.session.messages || []

  // navigation menus
  req.view.menus = {
    breadcrumb: builder.nav.buildBreadcrumbMenu(req.originalUrl),
    user: builder.nav.buildUserMenu(req.session.user),
    editor: builder.nav.buildEditorMenu(req.session.user, req)
  }

  next();
});

// =====================================
// map routes -> controllers
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
// default handlers
// ---------------------------------
app.use(utils.error.errorHandler);
app.use(utils.error.notFoundHandler);

module.exports = app;