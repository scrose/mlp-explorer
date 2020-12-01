/*!
 * MLP.API.App
 * File: app.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import express from 'express';
import cors from 'cors';
import methodOverride from 'method-override';
import session from './lib/session.js';
import { globalHandler, notFoundHandler } from './error.js';
import { authorize } from './lib/permissions.utils.js';
import { general } from './config.js';
import router from './routes/index.routes.js';

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
 * Set proxy and cross-origin settings (CORS).
 */

app.set('trust proxy', 1); // trust first proxy

const allowedOrigins = ["http://localhost:3000","http://localhost:3001"];

app.use(
    cors({
        origin: function(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg =
                    "The CORS policy for this site does not " +
                    "allow access from the specified Origin.";
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        }
    })
);

/**
 * Generate session.
 */

app.use(session);

/**
 * Define session-persistent messenger.
 */

app.use(function(req, res, next) {
    req.session.messages = [];
    res.locals.messages = []
    res.message = function (msg, type='info') {
        if (!req.hasOwnProperty('session'))
            throw Error('nosession');
        req.session.messages = req.session.messages || [];
        req.session.messages.push({ type: type, string: msg, });
        res.locals.messages.push({ type: type, string: msg, })
    };
    next()
});

/**
 * Define logger for development.
 */

// app.use(function (req, res, next) {
//     logger('dev');
// });

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
 * Define view parameters for template rendering (middleware)
 */

app.use(function(req, res, next) {

    if (!req.hasOwnProperty('session'))
        throw Error('nosession');

    // store response local variables scoped to the request
    res.locals.general = general;
    res.locals.user = req.session.user;
    res.locals.messages = req.session.messages || [];

    // clear message bank
    req.session.messages = [];

    // check user session data
    console.log('Session: ', req.session.id);
    console.log('Active User: ', res.locals.user);
    console.log('Message Bank: ', res.locals.messages);
    next();
});

/**
 * Restrict access by user permissions.
 */

app.use(function(req, res, next) {
    authorize(req, res, next);

    // set navigation menus based on user settings
    // res.locals.menus = {
    //     breadcrumb: builder.nav.breadcrumbMenu(req, res),
    //     user: builder.nav.userMenu(res),
    //     editor: builder.nav.editorMenu(res),
    // };
});

/**
 * Initialize router.
 */

app.use('/', router);

/**
 * Set default global error handlers.
 */

app.use(function(err, req, res, next) {
    return globalHandler(err, req, res, next);
});
app.use(function(req, res, next) {
    return notFoundHandler(req, res, next);
});

export default app;
