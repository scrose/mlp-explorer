// /*!
//  * MLP.Core.Tests.Sessions
//  * File: /test/sessions.services.js
//  * Copyright(c) 2020 Runtime Software Development Inc.
//  * MIT Licensed
//  */
//
// import SessionStore from '../models/SessionStore';
// const Tester = require('./tester');
// const config = require('../src/config');
//
// /**
//  * Return tester module
//  */
// let tester = new Tester();
// module.exports = tester;
//
// /**
//  * Initialize test session.
//  * see documentation: https://github.com/expressjs/session
//  */
// SessionStore = new SessionStore();
// sess = {
//   id: 'test_session',
//   resave: false, // don't save session if unmodified
//   saveUninitialized: false, // don't create session until something stored
//   secret: config.session.secret,
//   // 'Time-to-live' in milliseconds
//   // maxAge: Date.now() + 10 * 1000 * config.session.ttl,
//   cookie: {
//     secure: false,
//     sameSite: true,
//     expires: new Date(Date.now() + 5 * 1000),
//   },
//   user: {
//     id: 'test_user_id',
//   },
// };
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
