/*!
 * MLP.API.DB.Services.Sessions
 * File: sessions.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import * as queries from '../queries/sessions.queries.js'
import pool from './db.services.js';


/**
 * Find session token by user ID.
 *
 * @public
 * @param {String} user_id
 * @return {Promise} result
 */

export async function select(user_id) {
    let { sql, data } = queries.select(user_id);
    return await pool.query(sql, data)
        .then(res => {
            return res.rows.length === 0 ? null : res.rows[0]
        });
}

/**
 * Upsert session in database.
 *
 * @public
 * @param {Object} args
 * @return {Promise} result
 */

export async function upsert(args) {
    let { sql, data } = queries.upsert(args);
    return await pool.query(sql, data)
        .then(res => {
            return res.rows.length === 0 ? null : res.rows[0]
        });
}

/**
 * Get all session tokens from database.
 *
 * @public
 * @return {Promise} result
 */

export async function getAll() {
    let { sql, data } = queries.getAll();
    return await pool.query(sql, data)
        .then(res => {
            return res.rows;
        });
}

/**
 * Remove session from database.
 *
 * @public
 * @param {String} user_id
 * @return {Promise} result
 */

export async function remove(user_id) {
    let { sql, data } = queries.remove(user_id);
    return await pool.query(sql, data)
        .then(res => {
            return res.rows.length === 0 ? null : res.rows[0]
        });
}

/**
 * Delete all session tokens from database.
 *
 * @public
 * @return {Promise} result
 */

export async function clear() {
    let { sql, data } = queries.clear();
    return await pool.query(sql, data)
        .then(res => {
            return res.rows;
        });
}

/**
 * Prune all expired session tokens from database.
 *
 * @public
 * @return {Promise} result
 */

export async function prune() {
    let { sql, data } = queries.prune();
    return await pool.query(sql, data)
        .then(res => {
            return res.rows;
        });
}
