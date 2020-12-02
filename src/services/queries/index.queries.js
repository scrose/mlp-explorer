/*!
 * MLP.API.Services.Queries
 * File: database.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import * as users from './users.queries.js';
import * as roles from './roles.queries.js';
import * as sessions from './sessions.queries.js';
import * as surveyors from './surveyors.queries.js';

/**
 * Index of module exports.
 * @public
 */

export default {
    users: users,
    roles: roles,
    sessions: sessions,
    surveyors: surveyors
};
