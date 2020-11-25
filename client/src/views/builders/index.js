/*!
 * MLP.Core.Views.Builders
 * File: /views/builders/index.test.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

const FormBuilder = require('./forms');

/**
 * Module exports.
 * @public
 */

exports.nav = require('./nav');

/**
 * Build form DOM and export as JSON schema
 *
 * @public
 * @param {Object} params
 * @return {JSON} DOM schema
 */

exports.form = (params) => {
    let formBuilder = new FormBuilder();
    let {form, validator} = formBuilder.build(params)
    return {form: JSON.stringify(form), validator: JSON.stringify(validator)};
}