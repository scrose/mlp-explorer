/*!
 * MLP.API.Tests.Setup
 * File: setup.js
 * Copyright(c) 2020 Runtime Software Development Inc.
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

/**
 * HTTP integration testing with Chai assertions.
 * See: https://www.chaijs.com
 */

chai.use(sinonChai);
chai.use(chaiHttp);

/**
 * Export test modules.
 */

export const agent = chai.request.agent(app);
export const { expect } = chai;
export const server = supertest.agent(app);
export const BASE_URL = '/';