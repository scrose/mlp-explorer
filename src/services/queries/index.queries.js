/*!
 * MLP.API.Services.Queries
 * File: index.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import * as users from './users.queries.js';
import * as sessions from './sessions.queries.js';
import * as surveyors from './visits.queries.js';
import * as defaults from '../queries.services.js';

/**
 * Index of module exports.
 * @public
 */

export default {
    defaults: defaults,
    users: users,
    sessions: sessions,
    surveyors: surveyors
};
