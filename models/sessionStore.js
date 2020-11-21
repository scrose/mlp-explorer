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

const config = require('../config');
const LocalError = require('./error')
const {Store} = require('express-session');
const sessionServices = require('../services')({ type: 'sessions' });
const cron = require('node-cron');

/** @returns {number} */
const currentTimestamp = () => Math.ceil(Date.now());

/**
 * Module constants.
 * @private
 */

const prefix = '_sess_';

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
 * @param {string} sid – the session id
 * @param {function} fn
 *        – a standard Node.js callback returning the parsed session object
 * @public
 */

SessionStore.prototype.get = function (sid, callback=noop()) {

    let key = prefix + sid

    sessionServices.findBySessionId(key, currentTimestamp())
        .then((result) => {
            if (result.rows.length === 0) callback(null);
            const sess_data = result.rows[0].session_data;
            let session = (typeof sess_data === 'string') ? JSON.parse(sess_data) : sess_data
            console.log('GET Session %s:', sid)
            printSession(session)
            return callback(null, session);
        })
        .catch((err) => {
            console.error('SESSION %s GET Error: ', sid, err)
            return callback(err, null)
        });

        if (sess.cookie) {
            var expires = typeof sess.cookie.expires === 'string'
                ? new Date(sess.cookie.expires)
                : sess.cookie.expires

            // destroy expired session
            if (expires && expires <= Date.now()) {
                delete this.sessions[sessionId]
                return
            }
        }

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

SessionStore.prototype.set = function (sid, sess, callback) {
    let session_json, args;
    try {
        session_json = JSON.stringify(sess);
        args = {
            session_id: prefix + sid,
            expires: new Date(_getExpireTime(sess) * 1000),
            session_data: session_json
        };
    }
    catch (err) {
        console.error('SESSION set() Error: ', err)
        return callback(err)
    }

    // show session parameters
    console.log('SET Session %s:', sid)
    printSession(sess)


    sessionServices.upsert(args)
        .then((data) => {
            if (data.rows.length === 0) throw LocalError('session');
            return callback()
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

SessionStore.prototype.touch = function (sid, sess, callback) {
    // var currentSession = getSession.call(this, sid)
    //
    // if (currentSession) {
    //     // update expiration
    //     currentSession.cookie = session.cookie
    //     this.sessions[sid] = JSON.stringify(currentSession)
    // }
    //
    // callback && defer(callback)

    let sess_json
    try {
        sess_json = JSON.stringify(sess);
    }
    catch (err) {
        console.error('SESSION touch() Error: ', err)
        return callback(err)
    }

    let args = {
        session_id: prefix + sid,
        session_data: sess_json,
        expires: new Date(_getExpireTime(null) * 1000)
    }

    // show session parameters
    console.log('TOUCH Session %s:', sid)
    console.log('- Expires %s:', args.expires.toLocaleString())
    console.log('- Current %s:', new Date(currentTimestamp()).toLocaleString())
    printSession(sess)

    sessionServices.update(args)
        .then((data) => {
            if (data.rows.length === 0) throw LocalError('session');
            callback(null)
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

SessionStore.prototype.destroy = function(sid, callback = noop) {
    let key = prefix + sid
    console.log('Deleting SESSION ID %s', key);
    sessionServices.delete(key)
        .then((result) => {
            if (result.rows.length === 0)
                console.log('\t - SESSION ID %s was not found. Deletion cancelled.', key);
            else
                console.log('\t - Deleted SESSION ID %s.', result.rows[0])
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
 * Does garbage collection for expired sessions in the database.
 * Scheduled tasks use using crontab to be run on the server periodically.
 *
 * @param {SimpleErrorCallback} [fn] - standard Node.js callback called on completion
 * @access public
 */

// Remove the error.log file every twenty-first day of the month.
// cron.schedule('0 0 21 * *', function() {
//     console.log('---------------------');
//     console.log('Running Cron Job');
//     fs.unlink('./error.log', err => {
//         if (err) throw err;
//         console.log('Error file successfully deleted');
//     });
// });

cron.schedule('* * * * *', function() {
    sessionServices.prune()
        .then((result) => {
            result.rows.forEach((sess)=>{
                console.log('Session %s pruned.', sess.session_id)
            })
        })
        .catch((err) => {
            console.error('SESSION prune() Error: ', err)
            if (fn && typeof fn === 'function') {
                return fn(err);
            }
        });
});

/**
 * This private method is used to compute the Time-to-live (TTL)
 * from configuration settings and convert it from milliseconds
 * to seconds.
 *
 * @param {object} sess – the session object to store
 * @returns {number} the unix timestamp, in seconds
 * @access private
 */

function _getExpireTime(sess) {
    let expire
    let now = currentTimestamp()
    if (sess && sess.cookie && sess.cookie.expires) {
        const expireDate = new Date(sess.cookie.expires);
        expire = Math.ceil(expireDate.valueOf() / 1000);
    }
    else {
        expire = Number(now / 1000 + config.session.ttl);
    }
    return expire;
}

/**
 * Print expiry details to console.
 *
 * @param {object} session – the session object to store
 * @access private
 */

function printSession(session) {
    if (session.cookie) {
        let expires = typeof session.cookie.expires === 'string'
            ? new Date(session.cookie.expires)
            : session.cookie.expires;
        let now = currentTimestamp()
        let ttex = Number(expires.valueOf() - now) / 1000
        console.log('- Cookie Data:\n\t %s', session.cookie)
        console.log(
            '- Expires: %s\n- Current: %s\n- Time Remaining: %s sec\n',
            expires.toLocaleString(),
            new Date(now).toLocaleString(),
            ttex
        )
        if (expires && ttex <=0) {
            console.error(' --- Cookie expired.'
            )
        }
    }
}