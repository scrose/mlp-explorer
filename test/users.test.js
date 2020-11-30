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

import { expect, server, agent, BASE_URL } from './setup.js';
import mocha from 'mocha';


/**
 * List all users (unauthenticated)
 * @private
 */

mocha.describe('Check user restrictions (unauthenticated)', () => {
    mocha.it('Should get restricted page for list', (done) => {
        agent
            .get(`${BASE_URL}users`)
            .then((res) => {
                console.log(req)
                expect(res.status).to.equal(500);
                done();
            })
            .catch((err) => {
                console.log(err)
                done();
            });
    })
});

/**
 * List all users (authenticated)
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
 * Create new user.
 * @private
 */

let cookies;
let user = {
    user_id: null,
    email: 'user@example.ca',
    password: '5565lSSR!3323',
    hash: null,
    salt: null,
    role_id: 2
}

mocha.describe('Register new user', () => {
    mocha.it('Insert user data', (done) => {
        server
            .post(`${BASE_URL}users/register`)
            .set('Accept', 'application/json')
            .send({
                email: user.email,
                password: user.password,
                role_id: user.role_id
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                // console.log('Confirm new user:', res.body)
                expect(res.status).to.equal(200);
                expect(res.body).to.instanceOf(Object);

                // expect(res.body.messages).to.equal(['user_id']);
                done();
                // Save the cookie to use it later to retrieve the session
                user.user_id = res.body.user_id;
                console.log('New user ID:', user.user_id);
                // Save the cookie to use it later to retrieve the session
                cookies = res.headers['set-cookie'].pop().split(';')[0];
            });
    });
});

/**
 * Show user data.
 * @private
 */

mocha.describe('Show user profile', () => {
    mocha.it('Get user data by Id', (done) => {
        server
            .get(`${BASE_URL}users/${user.user_id}`)
            .expect(200)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.user).to.instanceOf(Object);
                expect(res.body.user).to.have.property('user_id');
                expect(res.body.user).to.have.property('role_id');
                expect(res.body.user).to.have.property('email');
                expect(res.body.user).to.have.property('created_at');
                expect(res.body.user).to.have.property('updated_at');
                expect(res.body.user.user_id).to.equal(user.user_id);
                expect(res.body.user.email).to.equal(user.email);
                expect(res.body.user.role_id).to.equal(user.role_id);
                done();
            });
    });
});

/**
 * Update user data.
 * @private
 */

let newEmail = 'new@example.ca';
let newRoleId = 4;

mocha.describe('Update user data', () => {
    mocha.it('Change user email and role', (done) => {
        server
            .post(`${BASE_URL}users/${user.user_id}/edit`)
            .set('Accept', 'application/json')
            .expect(200)
            .send({
                email: newEmail,
                role_id: newRoleId
            })
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.user).to.instanceOf(Object);
                expect(res.body.user).to.have.property('user_id');
                expect(res.body.user).to.have.property('role_id');
                expect(res.body.user).to.have.property('email');
                expect(res.body.user).to.have.property('created_at');
                expect(res.body.user).to.have.property('updated_at');
                expect(res.body.user.user_id).to.equal(user.user_id);
                expect(res.body.user.email).to.equal(newEmail);
                expect(res.body.user.role_id).to.equal(newRoleId);
                done();
            });
    });
});

/**
 * Sign-in/out user.
 * @private
 */

mocha.describe('Login/Logout user', () => {
    mocha.it('Authenticate wrong email should fail', (done) => {
        server
            .post(`${BASE_URL}login`)
            .set('Accept', 'application/json')
            .send({
                email: 'user@wrong_example.ca',
                password: user.password
            })
            .expect('Content-Type', /json/)
            .expect(500)
            .end((err, res) => {
                // console.log('Confirm new user:', res.body)
                expect(res.status).to.equal(500);
                expect(res.body).to.instanceOf(Object);
                done();
            });
    });
    mocha.it('Authenticate wrong password should fail', (done) => {
        server
            .post(`${BASE_URL}login`)
            .set('Accept', 'application/json')
            .send({
                email: user.email,
                password: 'WRONG_5565lSSR!3323'
            })
            .expect('Content-Type', /json/)
            .expect(500)
            .end((err, res) => {
                // console.log('Confirm new user:', res.body)
                expect(res.status).to.equal(500);
                expect(res.body).to.instanceOf(Object);
                done();
            });
    });
    mocha.it('Authenticate correct credentials', (done) => {
        server
            .post(`${BASE_URL}login`)
            .set('Accept', 'application/json')
            .send({
                email: 'user@example.ca',
                password: '5565lSSR!3323'
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                // console.log('Confirm new user:', res.body)
                expect(res.status).to.equal(200);
                expect(res.body).to.instanceOf(Object);
                // expect(res.body.messages).to.equal(['user_id']);
                done();
                // Save the cookie to use it later to retrieve the session
                // Save the cookie to use it later to retrieve the session
                console.log('User logged in:', res.body.user_id);
                cookies = res.headers['set-cookie'].pop().split(';')[0];
            });
    });
    mocha.it('Logout user', (done) => {
        server
            .post(`${BASE_URL}logout`)
            .set('Accept', 'application/json')
            .send({
                email: 'user@example.ca',
                password: '5565lSSR!3323'
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                // console.log('Confirm new user:', res.body)
                expect(res.status).to.equal(200);
                expect(res.body).to.instanceOf(Object);
                done();
                // Save the cookie to use it later to retrieve the session
                // Save the cookie to use it later to retrieve the session
                console.log('User logged out:', res.body.user_id);
                cookies = res.headers['set-cookie'].pop().split(';')[0];
            });
    });
});

/**
 *
 * Delete new user.
 * @private
 */

mocha.describe('Remove user', () => {
    mocha.it('Should delete user data', (done) => {
        server
            .post(`${BASE_URL}users/remove`)
            .set('Accept', 'application/json')
            .send({
                user_id: user.user_id
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.user_id).to.equal(user.user_id);
                done();
            });
    });
});

//
//
// var Cookies;
//
// describe('Functional Test <Sessions>:', function () {
//     it('should create user session for valid user', function (done) {
//         request(app)
//             .post('/v1/sessions')
//             .set('Accept','application/json')
//             .send({"email": "user_test@example.com", "password": "123"})
//             .expect('Content-Type', /json/)
//             .expect(200)
//             .end(function (err, res) {
//                 res.body.id.should.equal('1');
//                 res.body.short_name.should.equal('Test user');
//                 res.body.email.should.equal('user_test@example.com');
//                 // Save the cookie to use it later to retrieve the session
//                 Cookies = res.headers['set-cookie'].pop().split(';')[0];
//                 done();
//             });
//     });
//     it('should get user session for current user', function (done) {
//         var req = request(app).get('/v1/sessions');
//         // Set cookie to get saved user session
//         req.cookies = Cookies;
//         req.set('Accept','application/json')
//             .expect('Content-Type', /json/)
//             .expect(200)
//             .end(function (err, res) {
//                 res.body.id.should.equal('1');
//                 res.body.short_name.should.equal('Test user');
//                 res.body.email.should.equal('user_test@example.com');
//                 done();
//             });
//     });
// });
//
