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

import session from 'express-session';
import SessionStore from '../../models/SessionStore.js';
import { genUUID } from './secure.js';
import { session as config } from '../config.js';

/**
 * Initialize session variables and management.
 * see documentation: https://github.com/expressjs/session
 * @public
 */
// TODO: ensure cookie:secure is set to true for https on production server

export default session({
  genid: function () {
    return genUUID(); // use UUIDs for session IDs
  },
  store: new SessionStore(),
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: config.secret,
  // 'Time-to-live' in milliseconds
  maxAge: 1000 * config.ttl,
  cookie: {
    secure: false,
    sameSite: true,
    maxAge: 1000 * config.ttl,
  },
});
