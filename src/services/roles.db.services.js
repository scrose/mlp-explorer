/*!
 * MLP.API.Services.Data.Roles
 * File: roles.db.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import * as queries from './queries/roles.queries.js'
import pool from './pgdb.js';

/**
 * Insert role in database.
 *
 * @public
 * @param {Object} role
 * @return {Promise} result
 */

export async function insert(role) {
    let data = role.getData();
    return pool.query(
        queries.insert,
        [data.name, data.role_id],
    );
}

/**
 * Save role data to existing record in database.
 *
 * @public
 * @param {Object} role
 * @return {Promise} result
 */

export async function update(role) {
    let data = role.getData();
    return pool.query(
        queries.update,
        [data.role_id, data.name]
    );
}

/**
 * Find all user roles.
 *
 * @public
 * @return {Promise} result
 */

export async function getAll() {
    return pool.query(queries.findAll, []);
}

/**
 * Remove user role.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

export async function remove(id) {
    return pool.query(queries.remove, [id]);
}