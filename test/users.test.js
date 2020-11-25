/*!
 * MLP.API.Tests.Users
 * File: users.test.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import { expect, server, BASE_URL } from './setup.js';
import mocha from 'mocha';

mocha.describe('List all users', () => {
  mocha.it('List all users page', (done) => {
    server
      .get(`${BASE_URL}/users`)
      .expect(200)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.users).to.instanceOf(Array);
        res.body.users.forEach((u) => {
          expect(u).to.have.property('user_id');
          expect(u).to.have.property('role_id');
          expect(u).to.have.property('email');
          expect(u).to.have.property('created_at');
          expect(u).to.have.property('updated_at');
        });
        done();
      });
  });
});

mocha.describe('Show specified user', () => {
  mocha.it('Show user page', (done) => {
    server
      .get(`${BASE_URL}/users/0d658f82d0651c19872d331401842823`)
      .expect(200)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.user).to.instanceOf(Object);
        expect(res.body.user).to.have.property('user_id');
        expect(res.body.user).to.have.property('role_id');
        expect(res.body.user).to.have.property('email');
        expect(res.body.user).to.have.property('created_at');
        expect(res.body.user).to.have.property('updated_at');
        done();
      });
  });
});

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
