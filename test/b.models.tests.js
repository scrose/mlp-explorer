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
        id: null,
        name: 'Name Text',
        description: 'Description Text',
    },
    surveyors: {
        id: null,
        given_names: 'Given Names',
        last_name: 'Last Name',
        short_name: 'TEST',
        affiliation: "Affiliation"
    },
    surveys: {
        id: null,
        owner_id: 16,
        name: 'Some Name',
        historical_map_sheet: 'Historical Map Sheet',
    },
    surveySeasons: {
        id: null,
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
        id: null,
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
        id: null,
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
        id: null,
        owner_id: 9,
        date: '1927-01-01',
        comments: 'TEXT'
    },
    locations: {
        id: null,
        owner_id: 23,
        location_narrative: 'TEXT',
        location_identity: 'TEXT',
        lat: 100.1,
        long: 100.1,
        elevation: 100.1,
        legacy_photos_start: 5,
        legacy_photos_end: 8,
        published: true
    },
    historicCaptures: {
        id: null,
        owner_id: 64,
        owner_type: 'survey_seasons',
        plate_id:'529',
        fn_photo_reference: 'TEXT',
        f_stop: 555,
        shutter_speed: 34,
        focal_length: 12,
        capture_datetime: '2014-07-09 16:49:00.572006',
        cameras_id: 6,
        lens_id: null,
        digitization_location: 'LAC',
        digitization_datetime: '2014-07-09 16:49:00.572006',
        lac_ecopy: 'IDENTIFIER',
        lac_wo: 'IDENTIFIER',
        lac_collection: 'IDENTIFIER',
        lac_box: 'IDENTIFIER',
        lac_catalogue: 'IDENTIFIER',
        condition: 'DESCRIPTION',
        comments: 'TEXT'
    },
    captures:{
        id: null,
        owner_id: 1051,
        owner_type: 'locations',
        fn_photo_reference: 'IDENTIFIER',
        f_stop: 55,
        shutter_speed: 55,
        focal_length: 56,
        capture_datetime: '2014-07-09 16:49:00.572006',
        cameras_id: 6,
        lens_id: null,
        lat: 100.1,
        long: 100.1,
        elevation: 100.1,
        azimuth: 300,
        comments: 'TEXT',
        alternate: true
    },
    captureImages:{
        id: null,
        owner_id: 3897,
        owner_type: 'historic_captures',
        hash_key: 'IDENTIFIER',
        image: 'IDENTIFIER',
        file_size: 5566,
        x_dim: 1200,
        y_dim: 1600,
        image_state: 'MASTER',
        image_remote: 'IDENTIFIER',
        image_secure_token: 'IDENTIFIER',
        comments: 'TEXT',
        image_tmp: 'IDENTIFIER',
        image_remote_processing: false
    },
    images: {
        id: null,
        owner_id: 483,
        owner_type: 'locations',
        hash_key: 'IDENTIFIER',
        image: 'LC2_DSCF0342_011f9804-7099-11e2-a556-c82a14fffed2.JPG',
        file_size: 89089504,
        x_dim: 1200,
        y_dim: 1600,
        bit_depth: 8,
        image_remote: 'IDENTIFIER',
        image_secure_token: 'IDENTIFIER',
        comments: 'TEXT',
        lat: 100.1,
        long: 100.1,
        f_stop: 55,
        shutter_speed: 55,
        focal_length: 56,
        iso: 50,
        capture_datetime: '2014-07-09 16:49:00.572006',
        cameras_id: 6,
        lens_id: null,
        type: 'location',
        image_tmp: 'IDENTIFIER',
        image_remote_processing: false
    },
    cameras: {
        id: null,
        make: 'TEXT',
        model: 'TEXT',
        unit: 'TEXT',
        format: 'TEXT'
    },
    glass_plate_listings: {
        owner_id: 93,
        container: 'TEXT',
        plates: 'TEXT',
        notes: 'TEXT'
    },
    // lens: {
    //     brand: 'TEXT',
    //     focal_length: 4,
    //     max_aperture: 1.11
    // },
    maps: {
        owner_id: 36,
        nts_map: 'TEXT',
        historic_map: 'TEXT',
        links: 'TEXT'
    },
    metadata_files:{
        owner_id: 992,
        owner_type: 'stations',
        metadata_type: 'field_notes',
        filename: 'PATH/to/FILE'
    },
    participants: {
        last_name: 'TEXT',
        given_names: 'TEXT'
    },
    // participant_groups: {
    //     owner_id: 23,
    //     participant_id: 38,
    //     group_type: 'photographers_visits'
    // }
}

// enumerated types
const imageTypes = ['location', 'scenic'];
const imageStates = ['raw', 'master', 'interim', 'misc', 'gridded'];


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
                .get(`${BASE_URL}${modelRoute}/${testItem.id}`)
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
                    item.id = res.body.data.id;
                })
        });

        /**
         * Show item data.
         * @private
         */

        mocha.it('Show item data', async () => {
            await agent
                .get(`${BASE_URL}${modelRoute}/${item.id}`)
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
                .post(`${BASE_URL}${modelRoute}/${item.id}/edit`)
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
                .post(`${BASE_URL}${modelRoute}/${item.id}/remove`)
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


