/*!
 * MLP.API.Tests.Sessions
 * File: /test/database.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Create session.
 * @private
 */

import mocha from 'mocha';
import { BASE_URL, expect, server } from './setup.js';
import SessionStore from '../src/models/sessionstore.models.js';

/**
 * Initialize test session.
 * see documentation: https://github.com/expressjs/session
 */

let store = new SessionStore();
let sid = 'test_session';
let session_user_id = 'test_user_id';
let expiryDate = new Date(Date.now() + 5 * 1000);
let session = {
    id: sid,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: process.env.SESSION_SECRET,
    // 'Time-to-live' in milliseconds
    // maxAge: Date.now() + 10 * 1000 * config.session.ttl,
    cookie: {
        secure: false,
        sameSite: true,
        expires: expiryDate,
    },
    user: {
        id: session_user_id,
    },
};

/**
 * Test session lifecycle.
 */

mocha.describe('Session Lifecycle', () => {
    mocha.it('Clear all sessions', (done) => {
        store.clear(function(err) {
            if (err) done(err);
            else done();
        });
    });
    mocha.it('Get number of sessions', (done) => {
        store.length(function(err, n) {
            if (err) done(err);
            else {
                expect(n).to.equal(0);
                done();
            }
        });
    });
    mocha.it('Set session data', (done) => {
        store.set(sid, session, function(err) {
            if (err) done(err);
            else done();
        });
    });
    mocha.it('Get session data', (done) => {
        store.get(sid, function(err, sessionData) {
            if (err) done(err);
            else  {
                const cookieExpiry = new Date(sessionData.cookie.expires)
                expect(sessionData.id).to.equal(sid);
                expect(sessionData.user.id).to.equal(session_user_id);
                expect(cookieExpiry.valueOf()).to.equal(expiryDate.valueOf());
                done();
            }
        });
    });
    mocha.it('Touch session', (done) => {
        store.touch(sid, session, function(err) {
            if (err) done(err);
            else  done();
        });
    });
    mocha.it('Destroy session', (done) => {
        store.destroy(sid, function(err) {
            if (err) done(err);
            else  done();
        });
    });
    mocha.it('Get number of sessions', (done) => {
        store.length(function(err, n) {
            if (err) done(err);
            else {
                expect(n).to.equal(0);
                done();
            }
        });
    });
});

//

// /**
//  * Add routes
//  */
// app.get('/', function (req, res) {
//   res.send("Unit Tests")
// })
//
// // Sessions tests
// app.get('/sessions', function (req, res) {
//   sessionTests.run('delete_session', 1000)
//   sessionTests.run('set_session', 1500)
//   sessionTests.run('get_session', 1600)
//   sessionTests.run('touch_session', 2000)
//   sessionTests.run('get_session', 9000)
//   sessionTests.print(10000)
// });
//
//
// // test sessions services
// request(app)
//     .get('/sessions')
//     .expect('Content-Type', /json/)
//     .expect(200)
//     .end(function(err, res) {
//       // console.log(res)
//       if (err) throw err;
//     });
//
// module.exports = app;



//
// const Tester = require('./tester');
// const config = require('../src/config');
//
// /**
//  * Return tester module
//  */
// let tester = new Tester();
// module.exports = tester;
//

//
// /**
//  * Show session values.
//  */
//
// console.log('\nSession: %s \nExpires: %s', sess, sess.cookie.expires.toLocaleString());
//
// /**
//  * Add session tests
//  */
//
// tester.add('delete_session', sessStore.destroy, ['test_session', tester.cb], null);
//
// tester.add('set_session', sessStore.set, ['test_session', sess, tester.cb], null);
//
// tester.add('get_session', sessStore.get, ['test_session', tester.cb], null);
//
// tester.add('touch_session', sessStore.touch, ['test_session', sess, tester.cb], null);
