/*!
 * MLP.Core.Utilities.Session
 * File: /lib/session.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const session = require('express-session');
const sessionStore = require('../models/sessionStore')
const secure = require('./secure')
const config = require('../config');

/**
 * Initialize session variables and management.
 * see documentation: https://github.com/expressjs/session
 * @public
 */
// TODO: ensure cookie:secure is set to true for https on production server

module.exports = session({
        genid: function(req) {
            return secure.genUUID() // use UUIDs for session IDs
        },
        store: new sessionStore(),
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        secret: config.session.secret,
        // 'Time-to-live' in milliseconds
        maxAge: Date.now() + (1000 * config.session.ttl),
        cookie: {
            secure: false,
            sameSite: true,
            // httpOnly: true,
            // domain: 'example.com',
            // path: 'foo/bar',
            expires: new Date(Date.now() + (config.session.ttl * 1000))
        }
    })