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
const methodOverride = require('method-override');
const builder = require('./views/builders');
const session = require('./lib/session');
const error = require('./error')
const permit = require('./lib/permissions')
const messages = require('./lib/messages');
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

app.use(
    logger('dev')
);

/**
 * Serve static files.
 */

app.use(express.static(
    path.join(__dirname, 'public'))
);

/**
 * Parse request bodies (req.body)
 */

app.use(
    express.urlencoded({ extended: true })
)
app.use(
    express.json()
);

/**
 * Allow overriding methods in query (?_method=put)
 */

app.use(
    methodOverride('_method')
);

/**
 * Define view parameters for template rendering (middleware)
 */

app.use(function(req, res, next) {

    // store response local variables scoped to the request
    res.locals.general = config.settings.general;
    res.locals.view = path.parse(req.originalUrl).base;
    res.locals.user = req.session.user

    // store authorization

    // check user session data
    console.log('Session: ', req.session.id);
    console.log('Active User: ', res.locals.user);
    console.log('Message Bank: ', JSON.stringify(res.locals.messages));

    // navigation menus
    res.locals.menus = {
    breadcrumb: builder.nav.breadcrumbMenu(req.originalUrl, res.locals.user),
    user: builder.nav.userMenu(res.locals.user),
    editor: builder.nav.editorMenu(res.locals.user, res.locals)
    }

    next();
});

/**
 * Initialize router: map routes to controllers and views.
 */

require('./routes')(app, { verbose: true });


/**
 * Restrict user permissions by role.
 */

app.use(
    permit.authorize(req, res, next)
);


/**
 * Set default global error handlers.
 */

app.use(error.global);
app.use(error.notFound);

module.exports = app;