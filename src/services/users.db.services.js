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
 * Find all registered users.
 *
 * @public
 * @return {Promise} result
 */

export async function getAll() {
    let { sql, data } = queries.getAll();
    return pool.query(sql, data);
}

/**
 * Find user by user ID.
 *
 * @public
 * @param {String} user_id
 * @return {Promise} result
 */

export async function select(user_id) {
    let { sql, data } = queries.select(user_id);
    return pool.query(sql, data);
}

/**
 * Find user by email.
 *
 * @public
 * @param {String} email
 * @return {Promise} result
 */

export async function selectByEmail(email) {
    let { sql, data } = queries.selectByEmail(email);
    return pool.query(sql, data);
}

/**
 * Insert user in database.
 *
 * @public
 * @param {Object} user
 * @return {Promise} result
 */

export async function insert(user) {
    let { sql, data } = queries.insert(user);
    return pool.query(sql, data);
}

/**
 * Save user data to existing record in database.
 *
 * @public
 * @param {Object} user
 * @return {Promise} result
 */

export async function update(user) {
    let { sql, data } = queries.update(user);
    return pool.query(sql, data);
}

/**
 * Remove user.
 *
 * @public
 * @param {String} user_id
 * @return {Promise} result
 */

export async function remove(user_id) {
    let { sql, data } = queries.remove(user_id);
    return pool.query(sql, data);
}

/**
 * Initialize users table.
 *
 * @public
 * @return {Promise} result
 */

export async function init(data) {
    let statements = queries.init(data);
    // note: we don't try/catch this because if connecting throws
    // an exception we don't need to dispose of the client
    // (it will be undefined)
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        let res = await Promise.all(statements.map(async (s) => {
            return await client.query(s.sql, s.data);
        }));
        await client.query('COMMIT');
        return res;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}