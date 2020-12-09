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

import { expect, agent, BASE_URL, errors } from './setup.js';
import mocha from 'mocha';

/**
 * List all users (unauthenticated)
 * @private
 */

mocha.describe('Check user permissions (visitor)', () => {
    mocha.it('Should deny access to user list', async () => {
        await agent
            .get(`${BASE_URL}users`)
            .then((res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.equal(errors.restrict);
            })
    })

    mocha.it('Should deny access to other user profile', async () => {
        await agent
            .get(`${BASE_URL}users/${admin.user_id}`)
            .then((res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.equal(errors.restrict);
            })
    })

    mocha.it('Should deny access to user creation', async () => {
        await agent
            .get(`${BASE_URL}users/add`)
            .then((res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.equal(errors.restrict);
            })
        await agent
            .get(`${BASE_URL}users/create`)
            .then((res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.equal(errors.restrict);
            })
    })

    mocha.it('Should deny access to user deletion', async () => {
        await agent
            .get(`${BASE_URL}users/787897543543/remove`)
            .then((res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.equal(errors.restrict);
            })
        await agent
            .post(`${BASE_URL}users/787897543543/remove`)
            .then((res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.equal(errors.restrict);
            })
    })

    mocha.it('Should deny access to user updates', async () => {
        await agent
            .get(`${BASE_URL}users/787897543543/edit`)
            .then((res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.equal(errors.restrict);
            })
        await agent
            .post(`${BASE_URL}users/787897543543/edit`)
            .then((res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.equal(errors.restrict);
            })
    })

});



/**
 * Load admin data.
 * @private
 */

let admin = {
    user_id: process.env.API_USER,
    email: process.env.API_EMAIL,
    password: process.env.API_PASS,
    hash: process.env.API_HASH,
    salt: process.env.API_SALT,
    role_id: 5
}

/**
 * Sign-in administrator.
 * @private
 */

mocha.describe('Login Administrator', () => {
    mocha.it('Authenticate wrong email should fail', async () => {
        await agent
            .post(`${BASE_URL}login`)
            .set('Accept', 'application/json')
            .send({
                email: 'wrong@example.ca',
                password: admin.password
            })
            .then((res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.equal(errors.login);
            })
    });

    mocha.it('Authenticate wrong password should fail', async () => {
        await agent
            .post(`${BASE_URL}login`)
            .set('Accept', 'application/json')
            .send({
                email: admin.email,
                password: 'WRONG5565lSSR!3323'
            })
            .then((res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.equal(errors.login);
            })
    });

    mocha.it('Authenticate correct credentials', async () => {
        await agent
            .post(`${BASE_URL}login`)
            .set('Accept', 'application/json')
            .send({
                email: admin.email,
                password: admin.password
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.messages[0].type).to.equal('success');
                expect(res.body.messages[0].string).to.equal('Login successful.');
            })
    });

    mocha.it('Redundant login', async () => {
        await agent
            .get(`${BASE_URL}login`)
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res).to.have.status(200);
                // TODO: check that page redirected to home on redundant login
                // expect(res.getHeaders()).to.equal('');
            })
    })
});

/**
 * Test user controllers (authenticated)
 * @private
 */

mocha.describe('User Controllers', () => {

    /**
     * List registered users.
     * @private
     */

    mocha.it('List all users page', async () => {
      await agent
          .get(`${BASE_URL}users`)
          .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body.users).to.instanceOf(Array);
              res.body.users.forEach((u) => {
                  expect(u).to.have.property('user_id');
                  expect(u).to.have.property('role_id');
                  expect(u).to.have.property('email');
                  expect(u).to.have.property('created_at');
                  expect(u).to.have.property('updated_at');
              });
          })
    });

    /**
     * Create new user.
     * @private
     */

    let user = {
        user_id: null,
        email: 'aaaaaaaaaaaaaaaaaaaaaaa@example.ca',
        password: '5565lSSR!3323',
        hash: null,
        salt: null,
        role_id: 2
    }

    mocha.it('Register new user', async () => {
        await agent
            .post(`${BASE_URL}users/register`)
            .set('Accept', 'application/json')
            .send({
                email: user.email,
                password: user.password,
                role_id: user.role_id
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.messages[0].type).to.equal('success');
                expect(res.body.messages[0].string).to.equal(`Registration successful for user ${user.email}!`);
                expect(res.body.user_id).to.not.equal(null);
                user.user_id = res.body.data.user_id;
            })
    });

    /**
     * Show user data.
     * @private
     */

    mocha.it('Show user profile', async () => {
        await agent
            .get(`${BASE_URL}users/${user.user_id}`)
            .set('Accept', 'application/json')
            .then((res) => {
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
            })
    });

    /**
     * Update user data.
     * @private
     */

    user.email = 'new@example.ca';
    user.role_id = 4;

    mocha.it('Update user email and role', async () => {
        await agent
            .post(`${BASE_URL}users/${user.user_id}/edit`)
            .set('Accept', 'application/json')
            .send({
                user_id: user.user_id,
                email: user.email,
                role_id: user.role_id
            })
            .then((res) => {
                expect(res.status).to.equal(200);
                expect(res.body.data).to.instanceOf(Object);
                expect(res.body.data).to.have.property('user_id');
                expect(res.body.data).to.have.property('role_id');
                expect(res.body.data).to.have.property('email');
                expect(res.body.data).to.have.property('created_at');
                expect(res.body.data).to.have.property('updated_at');
                expect(res.body.data.user_id).to.equal(user.user_id);
                expect(res.body.data.email).to.equal(user.email);
                expect(res.body.data.role_id).to.equal(user.role_id);
            })
    });

    /**
     * Delete new user.
     * @private
    */

    mocha.it('Delete created user', async () => {
        await agent
            .post(`${BASE_URL}users/${user.user_id}/remove`)
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.messages[0].type).to.equal('success');
                expect(res.body.messages[0].string).to.equal(
                    `User ${user.email} successfully deleted.`
                );
            })
    });

});

/**
 * Sign-out administrator.
 * @private
 */

mocha.describe('Logout Administrator', () => {
    mocha.it('Sign out the admin account', async () => {
        await agent
            .post(`${BASE_URL}logout`)
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.messages[0].type).to.equal('success');
                expect(res.body.messages[0].string).to.equal('Successfully logged out!');
            })
    });
    mocha.it('Redundant logout', async () => {
        await agent
            .post(`${BASE_URL}logout`)
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res).to.have.status(200);
            })
    })
});
