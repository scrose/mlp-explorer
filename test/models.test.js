/*!
 * MLP.API.Tests.Models
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
import * as db from '../src/services/index.services.js';
import { models } from '../config.js';

/**
 * Compares output data to model schema
 * @param {Model} model
 * @param {Array} data
 * @private
 */

function compare(model, data) {
    data.forEach((item) => {
        // go through model properties
        Object.entries(model.fields)
            .forEach(([field, value]) => {
                expect(item).to.have.property(field);
            });
    });
}

let Model;

// Test all defined models
Object.entries(models).forEach(([modelName, params]) => {
    mocha.describe(`Test ${modelName} model`, () => {

        // store example record data
        let testItem;

        /**
         * List all items.
         * @private
         */

        mocha.it(`List all ${modelName} page`, async () => {

            // generate model constructor
            Model = await db.model.create(modelName);
            let model = new Model();

            await agent
                .get(`${BASE_URL}${modelName}`)
                .then((res) => {
                    testItem = res.body.data[0];
                    expect(res).to.have.status(200);
                    expect(res.body.data).to.instanceOf(Array);
                    compare(model, res.body.data);
                })
        });

        /**
         * Show item data.
         * @private
         */

        mocha.it(`Show ${modelName} item data`, async () => {

            // generate model constructor
            Model = await db.model.create(modelName);
            let model = new Model();

            await agent
                .get(`${BASE_URL}${modelName}/${testItem.id}`)
                .set('Accept', 'application/json')
                .then((res) => {
                    expect(res.status).to.equal(200);
                    compare(model, [res.body.data]);
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

    mocha.describe(`Test ${modelName} edits`, () => {

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

        let item = {
            id: null,
            given_names: 'Given Names',
            last_name: 'Last Name',
            short_name: 'TEST',
            affiliation: "Affiliation"
        }

        mocha.it(`Create new ${modelName}`, async () => {
            await agent
                .post(`${BASE_URL}${modelName}/add`)
                .set('Accept', 'application/json')
                .send(item)
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.messages[0].type).to.equal('success');
                    expect(res.body.messages[0].string).to.equal(`Added item to ${modelName}.`);
                    item.id = res.body.data.id;
                })
        });

        /**
         * Show item data.
         * @private
         */

        mocha.it('Show item data', async () => {
            await agent
                .get(`${BASE_URL}${modelName}/${item.id}`)
                .set('Accept', 'application/json')
                .then((res) => {
                    expect(res.status).to.equal(200);
                })
        });

        /**
         * Update item data.
         * @private
         */

        item.given_names = 'New Given Names';
        item.last_name = 'New Last Name';

        mocha.it('Update item data', async () => {
            await agent
                .post(`${BASE_URL}${modelName}/${item.id}/edit`)
                .set('Accept', 'application/json')
                .send(item)
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
                .post(`${BASE_URL}${modelName}/${item.id}/remove`)
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

})


