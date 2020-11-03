/*!
 * MLP.Core.App
 * File: app.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const express = require('express');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
const sessionStore = require('./models/sessionStore')
const methodOverride = require('method-override');
const builder = require('./views/builders');
const utils = require('./_utilities');
const error = require('./error')
const config = require('./config');

/**
 * Initialize main Express instance.
 */

const app = express();

/**
 * Hide Express usage information from public.
 */

app.disable('x-powered-by');

/**
 * Define the views parameters:
 * - View engine: set default template engine to "ejs"
 *   which prevents the need for using file extensions
 * - Views main directory: set views for error and 404 pages
 */

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Set proxy.
 */

app.set('trust proxy', 1) // trust first proxy

/**
 * Initialize session variables and management.
 * see documentation: https://github.com/expressjs/session
 */
// TODO: ensure cookie:secure is set to true for https on production server
app.use(session({
  genid: function(req) {
    return utils.secure.genUUID() // use UUIDs for session IDs
  },
  store: new sessionStore(),
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: config.session.secret,
  maxAge: config.session.TTL * 3600000,
  // cookie: { secure: false, sameSite: true, maxAge: 86400000 }
  cookie: { secure: false, sameSite: true, maxAge: 1 }
}));

/**
 * Define session-persistent messenger.
 *
 * @param {json} msg
 * @public
 */

app.response.message = function (msg) {
    if (msg && this.req.session) {
      this.req.session.messages = this.req.session.messages || [];
      this.req.session.messages.push(
          JSON.stringify({
            div: { attributes: {class: 'msg ' + msg.type}, textNode: msg.text }
          })
      );
    }
    return this;
}

/**
 * Define session-persistent messenger cleanup function to
 * delete all of the messages in the session.
 *
 * @public
 */

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


/**
 * Define logger for development.
 */

app.use(logger('dev'));


/**
 * Serve static files.
 */

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Parse request bodies (req.body)
 */

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

/**
 * Allow overriding methods in query (?_method=put)
 */

app.use(methodOverride('_method'));

/**
 * Define view parameters for template rendering (middleware)
 */

app.use(function(req, res, next) {
  // add boilerplate content
  req.view = config.settings.general;
  req.view.name = path.parse(req.originalUrl).base;

  // check user session data
  console.log('Current User: ', req.session.user || 'anonymous');
  console.log('Message Bank: ', req.session.messages);
  req.view.messages = req.session.messages || []

  // navigation menus
  req.view.menus = {
    breadcrumb: builder.nav.breadcrumbMenu(req.originalUrl),
    user: builder.nav.userMenu(req.session.user),
    editor: builder.nav.editorMenu(req.session.user, req)
  }

  next();
});

/**
 * Initialize router: map routes to controllers and views.
 */

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


/**
 * Set default global error handlers.
 */

app.use(error.global);
app.use(error.notFound);

module.exports = app;