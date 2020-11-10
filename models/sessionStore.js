/*!
 * MLP.Core.Models.SessionStore
 * File: /models/sessionStore.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const LocalError = require('./error')
const {Store} = require('express-session');
const sessionServices = require('../services')({ type: 'sessions' });

/**
 * Module constants.
 * @private
 */

const prefix = 'sess:';

/**
 * Module exports.
 * @public
 */

module.exports = SessionStore

/**
 * All callbacks should have a noop if none provided for compatibility
 * @public
 */

const noop = () => {}

/**
 * Create SessionStore class. Call base Store class as constructor.
 *
 * @public
 */
function SessionStore() {}

/**
 * Inherit methods from Model abstract class.
 */

SessionStore.prototype = Object.create(Store.prototype);

/**
 * Fetch session by the given session ID.
 * This required method is used to get a session from the store given a
 * session ID (sessionId). The callback should be called as callback(error, session).
 * The session argument should be a session if found, otherwise null or
 * undefined if the session was not found (and there was no error). A special
 * case is made when error.code === 'ENOENT' to act like callback(null, null).
 *
 * @param {string} sessionId
 * @param {function} callback
 * @public
 */

SessionStore.prototype.get = function (sessionId, callback=noop()) {

    let key = prefix + sessionId

    sessionServices.findBySessionId(key)
        .then((result) => {
            if (result.rows.length === 0) return callback();
            let session = result.rows[0].session_data;
            if (session.cookie) {
                let expires = typeof session.cookie.expires === 'string'
                    ? new Date(session.cookie.expires)
                    : session.cookie.expires;

                // destroy expired session
                if (expires && expires <= Date.now()) {
                    console.error('Cookie expired: %s', sessionId)
                    return callback(null, 'EXPIRED');
                }
            }
            callback(null, session);
        })
        .catch((err) => {
            console.error('SESSION get() Error: ', err)
            return callback(err)
        });
}

/**
 * Commit the given session associated with the given sessionId to the database.
 * This required method is used to upsert a session into the store given a
 * session ID (sessionId) and session (session) object. The callback should be
 * called as callback(error) once the session has been set in the store.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} callback
 * @public
 */

SessionStore.prototype.set = function (sessionId, session, callback) {

    let session_json, args;
    let user_id = session.hasOwnProperty('user') ? session.user.id : null;
    // Do not store session data for anonymous users
    if (!user_id) return callback();
    try {
        session_json = JSON.stringify(session);
        args = {
            user_id: user_id,
            session_id: prefix + sessionId,
            session_data: session_json,
            expires: _getTTL(session)
        };
    }
    catch (err) {
        console.error('SESSION set() Error: ', err)
        return callback(err)
    }

    console.log('Session parameters:', args);

    sessionServices.upsert(args)
        .then((data) => {
            if (data.rows.length === 0) throw LocalError('session');
            callback()
        })
        .catch((err) => {
            console.error('SESSION set() Error: ', err, callback)
            return callback(err)
        });
};

/**
 * Get number of active sessions.
 * This optional method is used to get the count of all sessions in the store.
 * The callback should be called as callback(error, len).
 *
 * @param {function} callback
 * @public
 */

SessionStore.prototype.length = function (callback) {
    sessionServices.findAll()
        .then((result) => {
            callback(null, result.rows.length);
        })
        .catch((err) => {
            return callback(err)
        });
}

/**
 * Touch the given session object associated with the given session ID.
 * This recommended method is used to "touch" a given session given a
 * session ID (sessionId) and session (session) object. The callback should
 * be called as callback(error) once the session has been touched.
 * This is primarily used when the store will automatically delete
 * idle sessions and this method is used to signal to the store the
 * given session is active, potentially resetting the idle timer.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} callback
 * @public
 */

SessionStore.prototype.touch = function (sessionId, session, callback) {
    // var currentSession = getSession.call(this, sessionId)
    //
    // if (currentSession) {
    //     // update expiration
    //     currentSession.cookie = session.cookie
    //     this.sessions[sessionId] = JSON.stringify(currentSession)
    // }
    //
    // callback && defer(callback)

    let sess_json
    try {
        sess_json = JSON.stringify(session);
    }
    catch (err) {
        console.error('SESSION touch() Error: ', err)
        return callback(err)
    }

    let args = {
        user_id: session.user.id || 'anonymous',
        session_id: prefix + sessionId,
        session_data: sess_json,
        expires: _getTTL(session)
    }

    sessionServices.update(args)
        .then((data) => {
            if (data.rows.length === 0) return callback(null, 'EXPIRED');
            callback(null, 'OK')
        })
        .catch((err) => {
            console.error('SESSION touch() Error: ', err)
            return callback(err)
        });
}


/**
 * This optional method is used to get all sessions in the store
 * as an array. The callback should be called as callback(error, sessions).
 *
 * @param {function} callback
 * @public
 */

SessionStore.prototype.all = function (callback = noop) {
    sessionServices.findAll()
        .then((result) => {
            if (result.rows.length === 0) throw new Error();
            callback(null, result.rows)
        })
        .catch((err) => {
            return callback(err, []);
        });
}

/**
 * This required method is used to destroy/delete a session from the store
 * given a session ID (sessionId). The callback should be called as
 * callback(error) once the session is destroyed.
 *
 * @param {string} sessionId
 * @param {function} callback
 * @public
 */

SessionStore.prototype.destroy = function(sessionId, callback = noop) {
    let key = prefix + sessionId
    console.log('Deleting SESSION ID %s', key);
    sessionServices.delete(key)
        .then((result) => {
            if (result.rows.length === 0) console.log('\t - Deleted SESSION ID %s was not stored.', key);
            else console.log('\t - Deleted SESSION ID %s', result.rows[0])
            callback();
        })
        .catch((err) => {
            console.error('SESSION destroy() Error: ', err)
            return callback(err)
        });
}

/**
 * This optional method is used to delete all sessions from the store.
 * The callback should be called as callback(error) once the store is cleared.
 *
 * @param {function} callback
 * @public
 */
SessionStore.prototype.clear = function (callback = noop) {
    sessionServices.deleteAll()
        .then(() => {
            callback();
        })
        .catch((err) => {
            console.error('SESSION clear() Error: ', err)
            return callback(err)
        });
}

/**
 * This private method is used to get all sessions in the store
 * as an array. The callback should be called as callback(error, sessions).
 *
 * @param {Session} session
 * @public
 */

function _getTTL(session) {
    let ttl = 86400;
    if (session && session.cookie && session.cookie.expires) {
        let ms = Number(new Date(session.cookie.expires)) - Date.now();
        ttl = Math.ceil(ms / 1000);
    }
    return ttl;
}