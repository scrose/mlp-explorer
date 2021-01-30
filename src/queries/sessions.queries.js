/*!
 * MLP.API.Models.Queries.Sessions
 * File: sessions.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Find session token by user ID.
 *
 * @param {String} user_id
 * @return {Function} SQL query function
 */

export function select(user_id) {
    return {
        sql: `SELECT token
              FROM sessions
              WHERE sessions.user_id=$1::varchar`,
        data: [user_id],
    };
}


/**
 * Find all session tokens.
 *
 * @return {Function} SQL query function
 */

export function getAll() {
    return {
        sql: `SELECT *
              FROM sessions`,
        data: [],
    };
}

/**
 * Upsert session token.
 *
 * @param {Object} session
 * @return {Function} SQL query function
 */

export function upsert(session) {
    return {
        sql: `INSERT INTO sessions (token, user_id, expiry)
              VALUES($1::varchar, $2::varchar, TO_TIMESTAMP($2))
              ON CONFLICT (user_id) DO UPDATE
                  SET
                      token = $1::varchar,
                      expiry = TO_TIMESTAMP($2)
              RETURNING *`,
        data: [session.token, session.user_id, session.expiry],
    };
}

/**
 * Delete session token.
 *
 * @param {String} user_id
 * @return {Function} SQL query function
 */

export function remove(user_id) {
    return {
        sql: `DELETE FROM sessions
              WHERE sessions.user_id = $1::varchar
              RETURNING sessions.token`,
        data: [user_id],
    };
}

/**
 * Delete all session tokens.
 *
 * @return {Function} SQL query function
 */

export function clear() {
    return {
        sql: `DELETE FROM sessions`,
        data: [],
    };
}

/**
 * Prune expired session tokens.
 *
 * @return {Function} SQL query function
 */

export function prune() {
    return {
        sql: `DELETE FROM sessions
              WHERE expiry < NOW()::timestamp
              RETURNING sessions.token`,
        data: [],
    };
}

