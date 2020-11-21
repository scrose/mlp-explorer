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
 * Find session by session ID.
 *
 * @public
 * @param {String} queryText
 */

exports.findBySessionId = (queryText) => {
    return (sid, expires) => {
        return db.query(queryText, [
            sid,
            expires.valueOf() / 1000
        ]);
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
            data.session_id,
            data.expires.valueOf() / 1000,
            data.session_data
        ]);
    }
}

/**
 * Touch session to keep from expiring.
 *
 * @public
 * @param {String} queryText
 */

exports.update = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.session_id,
            data.expires.valueOf() / 1000,
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
    return (sid) => {
        return db.query(queryText, [
            sid
        ]);
    }
}

/**
 * Prune expired sessions.
 *
 * @public
 * @param {String} queryText
 */

exports.prune = (queryText) => {
    return () => {
        return db.query(queryText, []);
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