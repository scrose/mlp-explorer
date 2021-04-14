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
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { globalHandler, notFoundHandler } from './error.js';
import router from './routes/index.routes.js';
import path from 'path';

/**
 * Get current working directory.
 */

const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);

/**
 * Create Express application.
 * @private
 */

export default () => {

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
     *   a response away from the declared _static-type
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
        "http://localhost:5000",
        "http://localhost:8080"
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
            },
            methods: ['GET', 'POST'],
            credentials: true,
            optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        })
    );

    /**
     * Parse request bodies (req.body)
     */

    app.use(morgan('dev'));

    app.use(express.urlencoded({
        extended: true
    }));

    app.use(express.json({
        extended: true
    }));

    /**
     * Parse cookies to store JWT session tokens.
     */

    app.use(cookieParser(
        process.env.COOKIE_SECRET
    ));

    /**
     * Response headers
     */

    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Credentials', 'true')
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        )
        next()
    });

    /**
     * Serve static assets.
     */

    app.use('/resources', express.static(process.env.UPLOAD_DIR));

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

    return app;
}
