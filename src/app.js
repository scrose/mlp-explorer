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
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import { genUUID } from './lib/secure.utils.js';
import SessionStore from './models/session.models.js';
import { globalHandler, notFoundHandler } from './error.js';
import { authorize } from './lib/permissions.utils.js';
import { general, session as config } from '../config.js';
import router from './routes/index.routes.js';


/**
 * Initialize main Express instance.
 */

const app = express();

/**
 * Express Security Middleware
 *
 * Hide Express usage information from public.
 * Use Helmet for security HTTP headers
 * - Strict-Transport-Security enforces secure (HTTP over SSL/TLS)
 *   connections to the server
 * - X-Frame-Options provides clickjacking protection
 * - X-XSS-Protection enables the Cross-site scripting (XSS)
 *   filter built into most recent web browsers
 * - X-Content-Type-Options prevents browsers from MIME-sniffing
 *   a response away from the declared content-type
 *   Content-Security-Policy prevents a wide range of attacks,
 *   including Cross-site scripting and other cross-site injections
 *
 *   Online checker: http://cyh.herokuapp.com/cyh.
 */

app.disable('x-powered-by');
app.use(helmet());

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
 * TODO: ensure secure is set to true for production server.
 */

app.use(
    session({
        genid: function () {
            return genUUID(); // use UUIDs for session IDs
        },
        store: new SessionStore(),
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        secret: process.env.SESSION_SECRET,
        // 'Time-to-live' in milliseconds
        maxAge: 1000 * config.ttl,
        cookie: {
            HttpOnly: true,
            secure: false,
            sameSite: true,
            maxAge: 1000 * config.ttl,
        },
}));

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
    return authorize(req, res, next);

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
