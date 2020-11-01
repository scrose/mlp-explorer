/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Utilities.Session
  File:         /_utilities/session.js
  ------------------------------------------------------
  Utility methods for handling session storage
  Dependencies: Express Session <https://github.com/expressjs/session>
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 29, 2020
  ======================================================
*/

'use strict';
const date = require('./date');
const sessionModel = require('../services')({ type: 'session' });

module.exports = function create(session) {
    const Store = session.Store

    // All callbacks should have a noop if none provided for compatibility
    const noop = () => {}

    class SessionStore extends Store {
        constructor(options = {client: sessionModel}) {
            super(options)
            if (!options.client) {
                throw new Error('A client must be directly provided.')
            }
            this.prefix = options.prefix == null ? 'sess:' : options.prefix
            this.scanCount = Number(options.scanCount) || 100
            this.serializer = options.serializer || JSON
            this.client = options.client
            this.ttl = options.ttl || 86400 // One day in seconds.
            this.disableTouch = options.disableTouch || false
        }

        get(sid, cb = noop) {
            /*
             This required method is used to get a session from the store given a
             session ID (sid). The callback should be called as callback(error, session).

             The session argument should be a session if found, otherwise null or
             undefined if the session was not found (and there was no error). A special
             case is made when error.code === 'ENOENT' to act like callback(null, null).
             */
            let key = this.prefix + sid

            this.client.findBySessionId(key)
                .then((data) => {
                    if (data.rows.length === 0) return cb();
                    let result = this.serializer.parse(data);
                    cb(null, result)
                })
                .catch((err) => {
                    console.error('SESSION get() Error: ', err)
                    cb(err)
                });

        }

        set(sid, sess, cb = noop) {
            /*
            This required method is used to upsert a session into the store given a
            session ID (sid) and session (session) object. The callback should be
            called as callback(error) once the session has been set in the store.
             */

            let sess_json
            try {
                sess_json = this.serializer.stringify(sess)
            }
            catch (err) {
                return cb(err)
            }

            let args = {
                session_id: this.prefix + sid,
                user_id: sess.user.id || 'anonymous',
                session_data: sess_json,
                expires: this._getTTL(sess)
            }

            console.log('Session parameters:', args);

            this.client.upsert(args)
                .then((data) => {
                    if (data.rows.length === 0) throw "Session could not be saved.";
                    cb()
                })
                .catch((err) => {
                    console.error('SESSION set() Error: ', err)
                    cb(err)
                });
        }

        touch(sid, sess, cb = noop) {
            /*
            This recommended method is used to "touch" a given session given a
            session ID (sid) and session (session) object. The callback should
            be called as callback(error) once the session has been touched.

            This is primarily used when the store will automatically delete
            idle sessions and this method is used to signal to the store the
            given session is active, potentially resetting the idle timer.
            */
            if (this.disableTouch) return cb()

            let sess_json
            try {
                sess_json = this.serializer.stringify(sess)
            }
            catch (err) {
                return cb(err)
            }

            let args = {
                session_id: this.prefix + sid,
                user_id: sess.user || 'anonymous',
                session_data: sess_json,
                expires: this._getTTL(sess)
            }

            this.client.update(args)
                .then((data) => {
                    if (data.rows.length === 0) throw "Session expired";
                    let result = this.serializer.parse(data.rows[0]);
                    // if (ret !== 1) return cb(null, 'EXPIRED')
                    cb(null, 'OK')
                })
                .catch((err) => {
                    console.error('SESSION touch() Error: ', err)
                    cb(err)
                });
        }

        destroy(sid, cb = noop) {
            /*
             This required method is used to destroy/delete a session from the store
             given a session ID (sid). The callback should be called as
             callback(error) once the session is destroyed.
             */
            let key = this.prefix + sid
            this.client.delete(key)
                .then((result) => {
                    cb();
                })
                .catch((err) => {
                    console.error('SESSION destroy() Error: ', err)
                    cb(err)
                });
        }

        clear(cb = noop) {
            /*
             This optional method is used to delete all sessions from the store.
             The callback should be called as callback(error) once the store is cleared.
             */
            this.client.deleteAll()
                .then((result) => {
                    cb();
                })
                .catch((err) => {
                    console.error('SESSION clear() Error: ', err)
                    cb(err)
                });
        }

        length(cb = noop) {
            /*
             This optional method is used to get the count of all sessions in the store.
             The callback should be called as callback(error, len).
             */
            this.client.findAll()
                .then((result) => {
                    cb(null, result.rows.length);
                })
                .catch((err) => {
                    cb(err)
                });
        }

        ids(cb = noop) {
            let prefixLen = this.prefix.length

            this._getAllKeys((err, keys) => {
                if (err) return cb(err)
                keys = keys.map((key) => key.substr(prefixLen))
                return cb(null, keys)
            })
        }

        all(cb = noop) {
            /*
             This optional method is used to get all sessions in the store
             as an array. The callback should be called as callback(error, sessions).
            */
            let prefixLen = this.prefix.length

            this.client.findAll()
                .then((result) => {
                    if (result.rows.length === 0) throw new Error();
                    return cb(null, result.rows)
                })
                .catch((err) => {
                    return cb(err, []);
                });
        }

        _getTTL(sess) {
            let ttl
            if (sess && sess.cookie && sess.cookie.expires) {
                let ms = Number(new Date(sess.cookie.expires)) - Date.now()
                ttl = Math.ceil(ms / 1000)
            } else {
                ttl = this.ttl
            }
            return ttl
        }

        _getAllKeys(cb = noop) {
            let pattern = this.prefix + '*'
            this._scanKeys({}, 0, pattern, this.scanCount, cb)
        }

        _scanKeys(keys = {}, cursor, pattern, count, cb = noop) {
            let args = [cursor, 'match', pattern, 'count', count]
            this.client.scan(args, (err, data) => {
                if (err) return cb(err)

                let [nextCursorId, scanKeys] = data
                for (let key of scanKeys) {
                    keys[key] = true
                }

                // This can be a string or a number. We check both.
                if (Number(nextCursorId) !== 0) {
                    return this._scanKeys(keys, nextCursorId, pattern, count, cb)
                }

                cb(null, Object.keys(keys))
            })
        }
    }

    return SessionStore
}
