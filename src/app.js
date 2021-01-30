/*!
 * MLP.API.App
 * File: app.js
 * Copyright(c) 2021 Runtime Software Development Inc.
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
import cookieParser from 'cookie-parser';
import { globalHandler, notFoundHandler } from './error.js';
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
 * Set proxy and cross-origin settings (CORS).
 */

app.set('trust proxy', 1); // trust first proxy

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5000"
];

app.use(cors({
        origin: function(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg =
                    "The CORS policy for this site does not " +
                    "allow access from the specified origin: \n" + origin;
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        }
    })
);


/**
 * Parse request bodies (req.body)
 */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Parse cookies to store JWT session tokens.
 */

app.use(cookieParser())

/**
 * Define view parameters for template rendering (middleware)
 */

app.use(function(req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

/**
 * Initialize router.
 */

app.use('/', router);

/**
 * Set default global error handlers.
 */

app.use(function(err, req, res, next) {
    globalHandler(err, req, res, next);
});
app.use(function(req, res, next) {
    notFoundHandler(req, res, next);
});

export default app;
