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
import valid from '../src/lib/validate.utils.js'

/**
 * List all users
 * @private
 */

mocha.describe('List all users', () => {
  mocha.it('List all users page', (done) => {
    server
      .get(`${BASE_URL}users`)
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

/**
 * Specified user profile.
 * @private
 */

mocha.describe('Show user profile', () => {
  mocha.it('Get user data by Id', (done) => {
    server
      .get(`${BASE_URL}users/ITtqyWEPAEgQZEOwTUgOkyNuJ2bRvkUMiuLW1fOQ3FqNBzvS`)
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


/**
 * Create new user.
 * @private
 */

mocha.describe('Confirm new user', () => {
    mocha.it('Insert user data', (done) => {
        server
            .post(`${BASE_URL}users/add`)
            .set('Accept', 'application/json')
            .send({
                email: valid.load('user@example.ca').isEmail().data,
                password: valid.load('5565lSSR!3323').isPassword().data,
                role_id: 2,
            })
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
