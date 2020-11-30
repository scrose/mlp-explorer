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

import * as queries from './queries/sessions.queries.js'
import pool from './pgdb.js';

/**
 * Upsert session in database.
 *
 * @public
 * @param {Object} args
 * @return {Promise} result
 */

export async function upsert(args) {
    return pool.query(
        queries.upsert,
        [args.session_id, args.expires, args.session_data],
    );
}

/**
 * Update session data to existing record in database.
 *
 * @public
 * @param {Object} args
 * @return {Promise} result
 */

export async function update(args) {
    return pool.query(
        queries.update,
        [args.session_id, args.expires, args.session_data]
    );
}

/**
 * Prune expired sessions.
 *
 * @public
 * @return {Promise} result
 */

export async function prune() {
    return pool.query(queries.prune, []);
}

/**
 * Find all sessions.
 *
 * @public
 * @return {Promise} result
 */

export async function getAll() {
    return pool.query(queries.findAll, []);
}

/**
 * Find session by ID (include expiry timestamp).
 *
 * @public
 * @param {String} id
 * @param {Object} timestamp
 * @return {Promise} result
 */

export async function select(id, timestamp) {
    return pool.query(queries.findById, [id, timestamp]);
}

/**
 * Remove session from database.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

export async function remove(id) {
    return pool.query(queries.remove, [id]);
}

/**
 * Remove all sessions from database.
 *
 * @public
 * @return {Promise} result
 */

export async function removeAll() {
    return pool.query(queries.removeAll, []);
}

/**
 * Initialize sessions table.
 *
 * @public
 * @return {Promise} result
 */

export async function init() {
    await pool.query(queries.init, []);
}