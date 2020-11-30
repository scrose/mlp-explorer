/*!
 * MLP.API.DB.Services.Users
 * File: users.db.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import * as queries from './queries/users.queries.js'
import pool from './pgdb.js';

/**
 * Insert user in database.
 *
 * @public
 * @param {Object} user
 * @return {Promise} result
 */

export async function insert(user) {
    let data = user.getData();
    return pool.query(
        queries.insert,
        [data.user_id, data.email, data.password, data.salt_token, data.role_id],
    );
}

/**
 * Save user data to existing record in database.
 *
 * @public
 * @param {Object} user
 * @return {Promise} result
 */

export async function update(user) {
    let data = user.getData();
    return pool.query(
        queries.update,
        [data.user_id, data.email, data.role_id]
    );
}

/**
 * Find user by email.
 *
 * @public
 * @param {String} email
 * @return {Promise} result
 */

export async function selectByEmail(email) {
    return pool.query(
        queries.findByEmail,
        [email]
    );
}

/**
 * Find all registered users.
 *
 * @public
 * @return {Promise} result
 */

export async function getAll() {
    return pool.query(queries.findAll, []);
}

/**
 * Find user by user ID.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

export async function select(id) {
    return pool.query(queries.findById, [id]);
}

/**
 * Remove user.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

export async function remove(id) {
    return pool.query(queries.remove, [id]);
}

/**
 * Initialize users table.
 *
 * @public
 * @return {Promise} result
 */

export async function init(data) {

    // create pgsql PL function
    await pool.query(queries.init.create, []);

    // execute function
    return pool.query(queries.init.exec, data);
}