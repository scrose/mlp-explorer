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

import logger from 'morgan';
import express from 'express';
import path from 'path';
import methodOverride from 'method-override';
// import builder from "../views/builders/database.js";
import session from './lib/session.js';
import { globalHandler, notFoundHandler } from './error.js';
import { authorize } from './lib/permissions.js';
import messages from './lib/messages.js';
import { general } from './config.js';
import apiRouter from '../src/routes/index.js';

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

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

/**
 * Set proxy.
 */

app.set('trust proxy', 1); // trust first proxy

/**
 * Generate session.
 */

app.use(session);

/**
 * Define session-persistent messenger.
 */

app.use(messages);

/**
 * Define logger for development.
 */

app.use(logger('dev'));

/**
 * Serve static files.
 */

app.use(express.static('./public'));

/**
 * Parse request bodies (req.body)
 */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Allow overriding methods in query (?_method=put)
 */

app.use(methodOverride('_method'));

/**
 * Express router.
 */

app.use('/api', apiRouter);

/**
 * Define view parameters for template rendering (middleware)
 */

app.use(function (req, res, next) {
  // store response local variables scoped to the request
  res.locals.general = general;
  res.locals.view = path.parse(req.originalUrl).base;
  res.locals.user = req.session.user;

  // check user session data
  console.log('Session: ', req.session.id);
  console.log('Active User: ', res.locals.user);
  console.log('Message Bank: ', JSON.stringify(res.locals.messages));

  next();
});

/**
 * Restrict access by user permissions.
 */

app.use(function (req, res, next) {
  authorize(req, res, next);

  // set navigation menus based on user settings
  // res.locals.menus = {
  //     breadcrumb: builder.nav.breadcrumbMenu(req, res),
  //     user: builder.nav.userMenu(res),
  //     editor: builder.nav.editorMenu(res),
  // };
});

/**
 * Initialize router: map routes to controllers and views.
 */

// require('../src/routes')(app, { verbose: true });

/**
 * Set default global error handlers.
 */

app.use(globalHandler);
app.use(notFoundHandler);

export default app;
