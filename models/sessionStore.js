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

const {ValidationError} = require('./error')
const {Store} = require('express-session');
const sessionServices = require('../services')({ type: 'session' });
const util = require('../_utilities')

/**
 * Module constants.
 * @private
 */

const prefix = 'sess:';

/**
 * Module exports.
 * @public
 */

module.exports = Store

/**
 * All callbacks should have a noop if none provided for compatibility
 * @public
 */

const noop = () => {}


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

Store.prototype.get = function get(sessionId, callback=noop()) {

    // if (!sess) {
    //     return
    // }
    //
    // // parse
    // sess = JSON.parse(sess)
    //
    // if (session.cookie) {
    //     var expires = typeof session.cookie.expires === 'string'
    //         ? new Date(session.cookie.expires)
    //         : session.cookie.expires
    //
    //     // destroy expired session
    //     if (expires && expires <= Date.now()) {
    //         delete this.sessions[sessionId]
    //         return
    //     }
    // }
    //
    // return sess

    let key = prefix + sessionId

    sessionServices.findBySessionId(key)
        .then((result) => {
            if (result.rows.length === 0) return callback();
            let data = JSON.parse(result.rows[0].session_data);
            callback(null, data)
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

Store.prototype.set = function set(sessionId, session, callback) {
    let session_json
    try {
        session_json = JSON.stringify(session)
    }
    catch (err) {
        return callback(err)
    }

    let args = {
        sessionId: prefix + sessionId,
        user_id: session.user.id || 'anonymous',
        session_data: session_json,
        expires: _getTTL(session)
    };

    console.log('Session parameters:', args);

    sessionServices.upsert(args)
        .then((data) => {
            if (data.rows.length === 0) throw "Session could not be saved.";
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

Store.prototype.length = function length(callback) {
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

Store.prototype.touch = function touch(sessionId, session, callback) {
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
        sess_json = JSON.stringify(sess)
    }
    catch (err) {
        return callback(err)
    }

    let args = {
        sessionId: prefix + sessionId,
        user_id: session.user || 'anonymous',
        session_data: sess_json,
        expires: _getTTL(sess)
    }

    sessionServices.update(args)
        .then((data) => {
            if (data.rows.length === 0) throw "Session expired";
            let result = JSON.parse(data.rows[0]);
            // if (ret !== 1) return callback(null, 'EXPIRED')
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

Store.prototype.all = function (callback = noop) {

    let prefixLen = prefix.length

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

/**
 * This required method is used to destroy/delete a session from the store
 * given a session ID (sessionId). The callback should be called as
 * callback(error) once the session is destroyed.
 *
 * @param {string} sessionId
 * @param {function} callback
 * @public
 */
Store.prototype.destroy = function(sessionId, callback = noop) {
    let key = prefix + sessionId
    sessionServices.delete(key)
        .then(() => {
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
Store.prototype.clear = function (callback = noop) {
    sessionServices.deleteAll()
        .then(() => {
            callback();
        })
        .catch((err) => {
            console.error('SESSION clear() Error: ', err)
            return callback(err)
        });
}