/*!
 * MLP.Core.Views.Builders
 * File: /views/builders/index.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

const FormBuilder = require('./forms');
const ValidatorBuilder = require('./validator');

/**
 * Module exports.
 * @public
 */

exports.nav = require('./nav');
exports.messages = require('./messages');

/**
 * Build form DOM and export as JSON schema
 *
 * @public
 * @param {Object} params
 * @return {JSON} DOM schema
 */

exports.form = (params) => {
    let formBuilder = new FormBuilder();
    return JSON.stringify(formBuilder.build(params));
}

/**
 * Build validator DOM and export as JSON schema
 *
 * @public
 * @param {Object} params
 * @return {JSON} DOM schema
 */

exports.validator = (params) => {
    let validatorBuilder = new ValidatorBuilder();
    return JSON.stringify(validatorBuilder.build(params))
}