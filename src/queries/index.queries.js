/*!
 * MLP.API.Services.Queries
 * File: index.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import * as schema from './schema.queries.js';
import * as model from './defaults.queries.js';
import * as nodes from './nodes.queries.js';
import * as files from './files.queries.js';
import * as users from './users.queries.js';
import * as sessions from './sessions.queries.js';


/**
 * Index of module exports.
 * @public
 */

export default {
    schema: schema,
    model: model,
    nodes: nodes,
    files: files,
    users: users,
    sessions: sessions
};
