/*!
 * MLP.API.Tests.Index
 * File: index.test.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import { expect, server, BASE_URL } from './setup.js';
import mocha from 'mocha';
import { general } from '../src/config.js'

mocha.describe('Index page test', () => {
  mocha.it('Gets base url', (done) => {
    server
      .get(`${BASE_URL}`)
      .expect(200)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.general.projectName).to.equal(general.projectName);
        expect(res.body.general.appName).to.equal(general.appName);
        expect(res.body.general.title).to.equal(general.title);
        done();
      });
  });
});
