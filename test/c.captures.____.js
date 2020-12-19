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

import { expect, agent, BASE_URL } from './setup.js';
import mocha from 'mocha';
import * as db from '../src/services/index.services.js';
import { humanize, toSnake } from '../src/lib/data.utils.js';

/**
 * Create mock items.
 * @private
 */

let mockItems = {
    projects: {
        nodes_id: null,
        name: 'Name Text',
        description: 'Description Text',
    },
    surveyors: {
        nodes_id: null,
        given_names: 'Given Names',
        last_name: 'Last Name',
        short_name: 'TEST',
        affiliation: "Affiliation"
    },
    surveys: {
        nodes_id: null,
        owner_id: 16,
        name: 'Some Name',
        historical_map_sheet: 'Historical Map Sheet',
    },
    surveySeasons: {
        nodes_id: null,
        owner_id: 16,
        year: 1933,
        geographic_coverage: 'TEST',
        record_id: 0,
        jurisdiction: 'TEST',
        affiliation: 'TEST',
        archive: 'TEST',
        collection: 'TEST',
        location: 'TEST',
        sources: 'TEST',
        notes: 'TEST'
    },
    stations: {
        nodes_id: null,
        owner_id: 40,
        owner_type: 'survey_seasons',
        name: 'TEST',
        lat: 100.1,
        long: 100.1,
        elevation: 100.1,
        nts_sheet: 'TEST',
        published: false
    },
    visits: {
        nodes_id: null,
        owner_id: 61,
        date: '2005-08-19',
        start_time: '14:00:00',
        finish_time: '17:00:00',
        pilot: 'TEST',
        rw_call_sign: 'TEXT',
        visit_narrative: 'TEXT',
        illustration: false,
        weather_narrative: 'TEXT',
        weather_temp: 14,
        weather_ws: 25,
        weather_gs: 34,
        weather_pressure: 101,
        weather_rh: 15,
        weather_wb: 22
    },
    historicVisits: {
        nodes_id: null,
        owner_id: 9,
        date: '1927-01-01',
        comments: 'TEXT'
    },
    locations: {
        nodes_id: null,
        owner_id: 23,
        location_narrative: 'TEXT',
        location_identity: 'TEXT',
        lat: 100.1,
        long: 100.1,
        elevation: 100.1,
        legacy_photos_start: 5,
        legacy_photos_end: 8,
        published: true
    }
}

/**
 * Compares output data to model schema
 * @param {Model} model
 * @param {Array} data
 * @private
 */

function compare(model, data) {
    data.forEach((item) => {
        // go through model properties
        Object.entries(model.attributes)
            .forEach(([field, _]) => {
                expect(item).to.have.property(field);
            });
    });
}

let Model;

// Test all defined models
Object.keys(mockItems).forEach(modelName => {

    // convert to snake case
    let modelRoute = toSnake(modelName);
    let modelTable = toSnake(modelName);
    let modelLabel = humanize(modelName);

    // Test model views
    mocha.describe(`Test ${modelLabel} views`, () => {

        // store example record data
        let testItem;

        /**
         * List all items.
         * @private
         */

        mocha.it(`List all ${modelLabel}`, async () => {

            // generate model constructor
            Model = await db.model.create(modelTable);
            let model = new Model();

            await agent
                .get(`${BASE_URL}${modelRoute}`)
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

        mocha.it(`Show ${modelLabel} item data`, async () => {

            // generate model constructor
            Model = await db.model.create(modelTable);
            let model = new Model();

            console.log(testItem)

            await agent
                .get(`${BASE_URL}${modelRoute}/${testItem.nodes_id}`)
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

    mocha.describe(`Test ${modelLabel} CRUD`, () => {

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
         * Get mock item.
         * @private
         */

        let item = mockItems[modelName];

        mocha.it(`Create new ${modelLabel}`, async () => {
            await agent
                .post(`${BASE_URL}${modelRoute}/add`)
                .set('Accept', 'application/json')
                .send(item)
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.messages[0].type).to.equal('success');
                    expect(res.body.messages[0].string).to.equal(`Added item to ${modelLabel}.`);
                    item.nodes_id = res.body.data.nodes_id;
                })
        });

        /**
         * Show item data.
         * @private
         */

        mocha.it('Show item data', async () => {
            await agent
                .get(`${BASE_URL}${modelRoute}/${item.nodes_id}`)
                .set('Accept', 'application/json')
                .then((res) => {
                    expect(res.status).to.equal(200);
                })
        });

        /**
         * Update item data.
         * @private
         */

        mocha.it('Update item data', async () => {
            await agent
                .post(`${BASE_URL}${modelRoute}/${item.nodes_id}/edit`)
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
                .post(`${BASE_URL}${modelRoute}/${item.nodes_id}/remove`)
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
                .get(`${BASE_URL}logout`)
                .set('Accept', 'application/json')
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.messages[0].type).to.equal('success');
                    expect(res.body.messages[0].string).to.equal('Successfully logged out!');
                })
        });
    });

})


