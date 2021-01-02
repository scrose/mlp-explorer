/*!
 * MLP.API.Tests.Uploads
 * File: uploads.test.js
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
 * Create mock file data.
 * @private
 */

let imgFiles = [
    '/Users/boutrous/Workspace/NodeJS/images/historic/hi-0027.tif',
    '/Users/boutrous/Workspace/NodeJS/images/modern/ri-0031.tif'
];

// /Users/boutrous/Workspace/NodeJS/images/modern/ri-0031 copy 2.tif
// /Users/boutrous/Workspace/NodeJS/images/modern/ri-0031 copy 3.tif
// /Users/boutrous/Workspace/NodeJS/images/modern/ri-0031 copy 4.tif
// /Users/boutrous/Workspace/NodeJS/images/modern/ri-0031 copy 5.tif
// /Users/boutrous/Workspace/NodeJS/images/modern/ri-0031 copy 6.tif
// /Users/boutrous/Workspace/NodeJS/images/modern/ri-0031 copy 7.tif
// /Users/boutrous/Workspace/NodeJS/images/modern/ri-0031 copy 8.tif
// /Users/boutrous/Workspace/NodeJS/images/modern/ri-0031 copy.tif
// /Users/boutrous/Workspace/NodeJS/images/modern/ri-0031.tif


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


});

/**
 * Test uploader.
 * @private
 */

mocha.describe('Upload controller', () => {

    /**
     * Upload multiple images
     * @private
     */

    mocha.it('Upload multiple images', async () => {
        await agent
            .post(`${BASE_URL}upload`)
            .set('Accept', 'application/json')
            .send({
                files: imgFiles
            })
            .then((res) => {
                console.log(res.body.files)
                expect(res).to.have.status(200);
                expect(res.body.messages[0].type).to.equal('success');
                expect(res.body.messages[0].string).to.equal(`Upload successful!`);
            })
    });
});
