/*!
 * MLP.API.Tests.Users
 * File: users.test.js
 * Copyright(c) 2021 Runtime Software Development Inc.
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
                expect(res).to.have.status(403);
                expect(res.body.message.msg).to.equal(errors.restricted.msg);
            })
    })

    mocha.it('Should deny access to other user profile', async () => {
        await agent
            .get(`${BASE_URL}users/${admin.user_id}`)
            .then((res) => {
                expect(res).to.have.status(403);
                expect(res.body.message.msg).to.equal(errors.restricted.msg);
            })
    })

    mocha.it('Should deny access to user creation', async () => {
        await agent
            .get(`${BASE_URL}users/add`)
            .then((res) => {
                expect(res).to.have.status(403);
                expect(res.body.message.msg).to.equal(errors.restricted.msg);
            })
        await agent
            .get(`${BASE_URL}users/create`)
            .then((res) => {
                expect(res).to.have.status(403);
                expect(res.body.message.msg).to.equal(errors.restricted.msg);
            })
    })

    mocha.it('Should deny access to user deletion', async () => {
        await agent
            .get(`${BASE_URL}users/787897543543/remove`)
            .then((res) => {
                expect(res).to.have.status(403);
                expect(res.body.message.msg).to.equal(errors.restricted.msg);
            })
        await agent
            .post(`${BASE_URL}users/787897543543/remove`)
            .then((res) => {
                expect(res).to.have.status(403);
                expect(res.body.message.msg).to.equal(errors.restricted.msg);
            })
    })

    mocha.it('Should deny access to user updates', async () => {
        await agent
            .get(`${BASE_URL}users/787897543543/edit`)
            .then((res) => {
                expect(res).to.have.status(403);
                expect(res.body.message.msg).to.equal(errors.restricted.msg);
            })
        await agent
            .post(`${BASE_URL}users/787897543543/edit`)
            .then((res) => {
                expect(res).to.have.status(403);
                expect(res.body.message.msg).to.equal(errors.restricted.msg);
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
    role: 'super_administrator'
}

let cValue;

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
                expect(res).to.have.status(401);
                expect(res.body.message.msg).to.equal(errors.invalidLogin.msg);
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
                expect(res).to.have.status(401);
                expect(res.body.message.msg).to.equal(errors.failedLogin.msg);
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
                console.log(res.headers)
                cValue = "token=" + JSON.stringify({sessionId: sessionId});
                expect(res).to.have.status(200);
                expect(res.body.message.msg).to.equal('Login successful!');
            })
    });

    mocha.it('Redundant login', async () => {
        await agent
            .post(`${BASE_URL}login`)
            .set('Accept', 'application/json')
            .send({
                email: admin.email,
                password: admin.password
            })
            .then((res) => {
                console.log(res.body)
                expect(res).to.have.status(403);
                expect(res.body.message.msg).to.equal('User is already logged in!');
            })
    });
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
          .set('Accept', 'application/json')
          .set('x-access-token', admin.token)
          .then((res) => {
              console.log(res.body)
              expect(res).to.have.status(200);
              expect(res.body.data).to.instanceOf(Array);
              res.body.data.forEach((u) => {
                  expect(u).to.have.property('user_id');
                  expect(u).to.have.property('role');
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
        email: 'test@example.ca',
        password: '5565lSSR!3323',
        hash: null,
        salt: null,
        role: 'registered'
    }

    mocha.it('Register new user', async () => {
        await agent
            .post(`${BASE_URL}users/new`)
            .set('Accept', 'application/json')
            .set('x-access-token', admin.token)
            .send({
                email: user.email,
                password: user.password,
                role: user.role
            })
            .then((res) => {
                console.log(res.body)
                user.user_id = res.body.data.user_id;
                expect(res).to.have.status(200);
                expect(res.body.message.type).to.equal('success');
                expect(res.body.message.msg).to.equal(`Registration successful for user ${user.email}!`);
                expect(res.body.data.email).to.equal(user.email);
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
            .set('x-access-token', admin.token)
            .then((res) => {
                console.log('Response:', res.body);
                expect(res.status).to.equal(200);
                expect(res.body.data).to.instanceOf(Object);
                expect(res.body.data).to.have.property('user_id');
                expect(res.body.data).to.have.property('role');
                expect(res.body.data).to.have.property('email');
                expect(res.body.data).to.have.property('created_at');
                expect(res.body.data).to.have.property('updated_at');
                expect(res.body.data.user_id).to.equal(user.user_id);
                expect(res.body.data.email).to.equal(user.email);
                expect(res.body.data.role).to.equal(user.role);
            })
    });

    /**
     * Get user edit form.
     * @private
     */

    mocha.it('Request user edit form', async () => {
        await agent
            .get(`${BASE_URL}users/${user.user_id}/edit`)
            .set('Accept', 'application/json')
            .set('x-access-token', admin.token)
            .then((res) => {
                console.log('Response', res.body)
                const attrs = res.body.model.attributes;

                expect(res.status).to.equal(200);

                // form attributes
                expect(attrs).to.have.property('user_id');
                expect(attrs).to.have.property('email');
                expect(attrs).to.have.property('role');

                // check role options
                console.log('Roles', attrs.role.options)
                expect(attrs.role.options.length).to.have.greaterThan(0);

                // form data
                expect(res.body.data).to.instanceOf(Object);
                expect(res.body.data).to.have.property('user_id');
                expect(res.body.data).to.have.property('role');
                expect(res.body.data).to.have.property('email');
                expect(res.body.data.user_id).to.equal(user.user_id);
                expect(res.body.data.email).to.equal(user.email);
                expect(res.body.data.role).to.equal(user.role);
            })
    });

    /**
     * Update user data.
     * @private
     */

    user.email = 'new@example.ca';
    user.role = 'administrator';

    mocha.it('Update user email and role', async () => {
        await agent
            .post(`${BASE_URL}users/${user.user_id}/edit`)
            .set('Accept', 'application/json')
            .set('x-access-token', admin.token)
            .send({
                user_id: user.user_id,
                email: user.email,
                role: user.role
            })
            .then((res) => {
                console.log('Response:', res.body)
                expect(res.status).to.equal(200);
                expect(res.body.data).to.instanceOf(Object);
                expect(res.body.data).to.have.property('user_id');
                expect(res.body.data).to.have.property('role');
                expect(res.body.data).to.have.property('email');
                expect(res.body.data).to.have.property('created_at');
                expect(res.body.data).to.have.property('updated_at');
                expect(res.body.data.user_id).to.equal(user.user_id);
                expect(res.body.data.email).to.equal(user.email);
                expect(res.body.data.role).to.equal(user.role);
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
            .set('x-access-token', admin.token)
            .then((res) => {
                console.log('Response:', res.body)
                expect(res).to.have.status(200);
                expect(res.body.message.type).to.equal('success');
                expect(res.body.message.msg).to.equal(
                    `User ${user.email} successfully deleted.`
                );
            })
    });

});