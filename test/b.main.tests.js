/*!
 * MLP.API.Tests.Index
 * File: index.test.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import { expect, server, BASE_URL } from './setup.js';
import mocha from 'mocha';
import labels from '../schema.js'

mocha.describe('Index page test', () => {
  mocha.it('Gets base url', (done) => {
    server
      .get(`${BASE_URL}`)
      .expect(200)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.labels.main.projectName).to.equal(labels.main.projectName);
        expect(res.body.labels.main.appName).to.equal(labels.main.appName);
        expect(res.body.labels.main.title).to.equal(labels.main.title);
        done();
      });
  });
});
