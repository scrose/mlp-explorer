/*!
 * MLP.Core.Models.SessionStore
 * File: /models/SessionStore.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import { session as config } from '../config.js';
import LocalError from './Error.js';
import sess from 'express-session';
import query from '../lib/database.js';
import * as sql from './queries/sessions.queries.js';
import cron from 'node-cron';
import debug from '../lib/debug.js';

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

export default SessionStore;

/**
 * All callbacks should have a noop if none provided for compatibility
 * @public
 */

const noop = () => {};

/**
 * Create SessionStore class. Call base Store class as constructor.
 *
 * @public
 */

function SessionStore() {
  // initialize sessions table
  query(sql.initSessions)
    .then(() => {
      debug('Sessions table generated.');
    })
    .catch((err) => {
      console.error('SESSION INIT Error: ', err);
    });
}

/**
 * Inherit methods from Model abstract class.
 */

SessionStore.prototype = Object.create(sess.Store.prototype);

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

SessionStore.prototype.get = function (sid, callback = noop()) {
  let key = prefix + sid;
  let now = currentTimestamp() / 1000;
    query(sql.findBySessionId, [key, now])
    .then((result) => {
      debug('GET Session ' + key);
      if (result.rows.length === 0) {
        debug('\tSession not found: ' + key);
        return callback(null);
      }
      const sess_data = result.rows[0].session_data;
      let session = typeof sess_data === 'string' ? JSON.parse(sess_data) : sess_data;
      printSession(session);
      return callback(null, session);
    })
    .catch((err) => {
      console.error('SESSION %s GET Error: ', sid, err);
      return callback(err, null);
    });
};

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
  let key = prefix + sid;
  let args;
  try {
    args = {
      session_id: key,
      expires: this._getExpires(sess),
      session_data: JSON.stringify(sess),
    };
  } catch (err) {
    console.error('SESSION %s SET() Error: ', key, err);
    return callback(err);
  }

  query(sql.upsert, [args])
    .then((data) => {
      if (data.rows.length === 0) throw LocalError('session');
      // show session parameters
      debug('SET Session ' + key);
      printSession(sess);
      return callback();
    })
    .catch((err) => {
      console.error('SESSION SET() Error: ', err, callback);
      return callback(err);
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
  query(sql.findAll)
    .then((result) => {
      callback(null, result.rows.length);
    })
    .catch((err) => {
      return callback(err);
    });
};

/**
 * Touch the given session object associated with the given session ID.
 * This recommended method is used to 'touch' a given session given a
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
  let key = prefix + sid;
  let args;
  try {
    args = {
      session_id: key,
      expires: this._getExpires(sess),
      session_data: JSON.stringify(sess),
    };
  } catch (err) {
    console.error('SESSION %s TOUCH() Error: ', key, err);
    return callback(err);
  }

  // show session parameters
  debug('TOUCH Session ' + key);
  printSession(sess);

  query(sql.update [args])
    .then((data) => {
      if (data.rows.length === 0) {
        debug('TOUCH Session not found ' + key);
        callback();
      }
      callback(null);
    })
    .catch((err) => {
      console.error('SESSION %s TOUCH() Error: ', key, err);
      return callback(err);
    });
};

/**
 * This optional method is used to get all sessions in the store
 * as an array. The callback should be called as callback(error, sessions).
 *
 * @param {function} callback
 * @public
 */

SessionStore.prototype.all = function (callback = noop) {
  query(sql.findAll)
    .then((result) => {
      if (result.rows.length === 0) throw new Error();
      callback(null, result.rows);
    })
    .catch((err) => {
      return callback(err, []);
    });
};

/**
 * This required method is used to destroy/delete a session from the store
 * given a session ID (sessionId). The callback should be called as
 * callback(error) once the session is destroyed.
 *
 * @param {string} sessionId
 * @param {function} callback
 * @public
 */

SessionStore.prototype.destroy = function (sid, callback = noop) {
  let key = prefix + sid;
  debug('Deleting SESSION ID ' + key);
  query(sql.remove, [key])
    .then((result) => {
      if (result.rows.length === 0) debug('- SESSION ID ' + key + 'was not found. Deletion cancelled.');
      else debug('- Deleted SESSION ID ' + result.rows[0].session_id);
      callback();
    })
    .catch((err) => {
      console.error('SESSION destroy() Error: ', err);
      return callback(err);
    });
};

/**
 * This optional method is used to delete all sessions from the store.
 * The callback should be called as callback(error) once the store is cleared.
 *
 * @param {function} callback
 * @public
 */
SessionStore.prototype.clear = function (callback = noop) {
  query(sql.removeAll)
    .then(() => {
      callback();
    })
    .catch((err) => {
      console.error('SESSION clear() Error: ', err);
      return callback(err);
    });
};

/**
 * This private method is used to compute the Expiry date
 * from the session cookie and convert it from milliseconds
 * to seconds.
 *
 * @param {object} sess – the session object to store
 * @returns {number} the unix timestamp, in seconds
 * @access private
 */

SessionStore.prototype._getExpires = function (sess) {
  let now = currentTimestamp() / 1000;
  if (sess && sess.cookie && sess.cookie.expires) {
    return typeof sess.cookie.expires === 'string'
      ? new Date(sess.cookie.expires).valueOf() / 1000
      : sess.cookie.expires.valueOf() / 1000;
  } else {
    return Number(now + 1000 * config.session.ttl);
  }
};

/**
 * Print expiry details to console.
 *
 * @param {object} session – the session object to store
 * @access private
 */

function printSession(session) {
  if (session.cookie) {
    let expires =
      typeof session.cookie.expires === 'string' ? new Date(session.cookie.expires) : session.cookie.expires;
    let now = currentTimestamp();
    let ttex = Number(expires.valueOf() - now) / 1000;
    debug('- Cookie Data:\n\t' + session.cookie);
    debug(
      '- Expires: ' +
        expires.toLocaleString() +
        '\n- Current: ' +
        new Date(now).toLocaleString() +
        '\n- Time Remaining: ' +
        ttex +
        ' sec'
    );
    if (expires && ttex <= 0) {
      console.error(' --- Cookie expired.');
    }
  }
}

/**
 * Does garbage collection for expired sessions in the database.
 * Scheduled tasks use using crontab to be run on the server periodically.
 *
 * @param {Function} [fn] - standard Node.js callback called on completion
 * @access public
 */

// Remove the error.log file every twenty-first day of the month.
// cron.schedule('0 0 21 * *', function() {
//     debug('---------------------');
//     debug('Running Cron Job');
//     fs.unlink('./error.log', err => {
//         if (err) throw err;
//         debug('Error file successfully deleted');
//     });
// });

cron.schedule(
  '* * * * *',
  function () {
    services
      .prune()
      .then((result) => {
        result.rows.forEach((sess) => {
          debug('Session pruned: \n\t' + sess.session_id);
        });
      })
      .catch((err) => {
        console.error('SESSION PRUNE() Error: ', err);
        if (fn && typeof fn === 'function') {
          return fn(err);
        }
      });
  },
  {}
);
