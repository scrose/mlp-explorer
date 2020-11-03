/*!
 * MLP.Core.Services.Sessions
 * File: /services/sessions/index.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const db = require('../../db')

/**
 * Find session by user ID.
 *
 * @public
 * @param {String} queryText
 */

exports.findByUserId = (queryText) => {
    return (user_id) => {
        return db.query(queryText, [user_id]);
    }
}

/**
 * Find session by session ID.
 *
 * @public
 * @param {String} queryText
 */

exports.findBySessionId = (queryText) => {
    return (session_id) => {
        return db.query(queryText, [session_id]);
    }
}

/**
 * Find all sessions.
 *
 * @public
 * @param {String} queryText
 */

exports.findAll = (queryText) => {
    return () => {
        return db.query(queryText, []);
    }
}

/**
 * Upsert session.
 *
 * @public
 * @param {String} queryText
 */

exports.upsert = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.user_id,
            data.session_id,
            data.session_data
        ]);
    }
}

/**
 * Update session.
 *
 * @public
 * @param {String} queryText
 */

exports.update = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.user_id,
            data.session_id,
            data.session_data
        ]);
    }
}

/**
 * Delete session.
 *
 * @public
 * @param {String} queryText
 */

exports.delete = (queryText) => {
    return (sessionID) => {
        return db.query(queryText, [
            sessionID
        ]);
    }
}

/**
 * Delete all sessions.
 *
 * @public
 * @param {String} queryText
 */

exports.deleteAll = (queryText) => {
    return () => {
        return db.query(queryText, []);
    }
}