/*!
 * MLP.API.Tests.Setup
 * File: setup.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import supertest from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiHttp from 'chai-http';
import app from '../src/app.js';
import * as errHandlers from '../src/error.js';

/**
 * HTTP integration testing with Chai assertions.
 * See: https://www.chaijs.com
 */

chai.use(sinonChai);
chai.use(chaiHttp);

/**
 * Compares output data to model schema
 * @param {Object} model
 * @param {Array} data
 * @private
 */

export function compare(model, data) {
    data.forEach((item) => {
        // go through model properties
        Object.entries(model.attributes)
            .forEach(([field, _]) => {
                expect(item).to.have.property(field);
            });
    });
}

/**
 * Export test modules.
 */

export const agent = chai.request.agent(app);
export const { expect } = chai;
export const server = supertest.agent(app);
export const BASE_URL = '/';
export const errors = errHandlers.errors;