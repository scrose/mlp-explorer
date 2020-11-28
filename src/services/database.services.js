/*!
 * MLP.API.Services.Database
 * File: database.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import pool from '../lib/database.js';
import * as queries from '../models/queries/index.queries.js'
import LocalError from '../models/error.js';

/**
 * Create database class to handle db query services.
 *
 * @public
 */

function Database() {
    this.queries = queries;
}

/**
 * Module exports.
 * @public
 */

export default new Database();

/**
 * Find all records in table
 *
 * @public
 * @param {String} table
 * @param {String} orderby
 * @return {Promise} result
 */

Database.prototype.getAll = async function(table) {

    if (typeof this.queries[table] === 'undefined')
        throw new LocalError();

    let query = this.queries[table].findAll
    return pool.query(query, []);
};

/**
 * Find record in table by column.
 *
 * @public
 * @param {String} table
 * @param {String} id
 * @param {String} orderby
 * @return {Promise} result
 */

Database.prototype.select = async function(table, id) {

    if (typeof this.queries[table] === 'undefined')
        throw new LocalError();

    if (typeof this.queries[table].findById === 'undefined')
        throw new LocalError();

    let query = this.queries[table].findById

    return pool.query(query, [id]);
};

/**
 * Find record in table by column.
 *
 * @public
 * @param {String} table
 * @param {String} id
 * @param {String} orderby
 * @return {Promise} result
 */

Database.prototype.remove = async function(table, id) {

    if (typeof this.queries[table] === 'undefined')
        throw new LocalError();

    if (typeof this.queries[table].remove === 'undefined')
        throw new LocalError();

    let query = this.queries[table].remove

    return pool.query(query, [id]);
};

/**
 * Initialize table.
 *
 * @public
 * @return {Promise} result
 */

Database.prototype.init = async function(table, data) {

    if (typeof this.queries[table] === 'undefined')
        throw new LocalError();

    if (typeof this.queries[table].init === 'undefined')
        throw new LocalError();

    if (!data || !Array.isArray(data))
        throw new LocalError();

    let query = this.queries[table].init

    let create = await pool.query(query.create, []);
    return pool.query(query.exec, data);
};
