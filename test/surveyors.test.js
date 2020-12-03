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

let model = 'surveyors'

mocha.describe('Test surveyors routes', () => {

    /**
     * List all items.
     * @private
     */

    mocha.it(`List all surveyors page`, async () => {
        await agent
            .get(`${BASE_URL}${model}`)
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.users).to.instanceOf(Array);
                res.body.data.forEach((u) => {
                    expect(u).to.have.property('id');
                    expect(u).to.have.property('given_names');
                    expect(u).to.have.property('last_name');
                    expect(u).to.have.property('updated_at');
                });
            })
    });

    /**
     * Show item data.
     * @private
     */

    let id = 17;

    mocha.it('Show item data', async () => {
        await agent
            .get(`${BASE_URL}${model}/${id}`)
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.status).to.equal(200);
            })
    });
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

mocha.describe('Test model edits', () => {

    mocha.it('Authenticate admin', async () => {
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

    /**
     * Create new item.
     * @private
     */

    let data = {
        id: null,
        given_names: 'Given Names',
        last_name: 'Last Name',
    }

    mocha.it('Create new item', async () => {
        await agent
            .post(`${BASE_URL}${model}/create`)
            .set('Accept', 'application/json')
            .send(data)
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.messages[0].type).to.equal('success');
                expect(res.body.messages[0].string).to.equal('Item successfully created!');
                item.id = res.body.id;
            })
    });

    /**
     * Show item data.
     * @private
     */

    mocha.it('Show item data', async () => {
        await agent
            .get(`${BASE_URL}${model}/${item.id}`)
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.status).to.equal(200);
            })
    });

    /**
     * Update item data.
     * @private
     */

    let newData = {
        given_names: 'New Given Names',
        last_name: 'New Last Name',
    }

    mocha.it('Update item data', async () => {
        await agent
            .post(`${BASE_URL}${model}/${item.id}/edit`)
            .set('Accept', 'application/json')
            .send(newData)
            .then((res) => {
                expect(res.status).to.equal(200);
            })
    });

    /**
     * Delete new item.
     * @private
    */

    mocha.it('Delete created item', async () => {
        await agent
            .post(`${BASE_URL}${model}/${item.id}/remove`)
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.messages[0].type).to.equal('success');
                expect(res.body.messages[0].string).to.equal('Item successfully deleted.');
            })
    });

});

/**
 * Sign-out administrator.
 * @private
 */

mocha.describe('Logout Administrator', () => {
    mocha.it('Sign out admin', async () => {
        await agent
            .post(`${BASE_URL}logout`)
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.messages[0].type).to.equal('success');
                expect(res.body.messages[0].string).to.equal('Successfully logged out!');
            })
    });
});
