/*!
 * MLP.API.DB.Services.Schema
 * File: roles.db.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */


import pool from './pgdb.js';

/**
 * Get table column information.
 *
 * @public
 * @param {String} table
 * @return {Promise} result
 */

export async function getSchema(table) {
    return pool.query(
        queries.getColumnsInfo,
        [table],
    );
}
