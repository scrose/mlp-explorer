/*!
 * MLP.Core.Models.Base
 * File: /models/Model.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import pool from '../lib/database.js';

/**
 * Module exports.
 * @public
 */

export default Model;

/**
 * Abstract base prototype for data models.
 *
 * @src private
 */

function Model(data=null) {
    this.name = null;
    this.label = null;
    this.schema = null;
    this.data = data;
    this.pool = null;

    const self = this;

    // merge data into schema
    if (typeof data === 'object' && data !== null) {
        const inputData = data.hasOwnProperty('rows') ? data.rows[0] : data;
        Object.entries(self.schema.fields).forEach(([key, field]) => {
            field.value = inputData.hasOwnProperty(key) ? inputData[key] : null;
        });
    } else {
        Object.entries(self.schema.fields).forEach(([_, field]) => {
            field.value = '';
        });
    }
}

/**
 * Set values of model schema fields.
 *
 * @param {Object} data
 * @src public
 */

Model.prototype.setData = function(data) {
    // set data values in schema
    if (typeof data === 'object') {
        const inputData = data.hasOwnProperty('rows') ? data.rows[0] : data;
        let model = this;
        Object.entries(this.schema.fields).forEach(([key, field]) => {
            field.value = inputData.hasOwnProperty(key) ? inputData[key] : null;
            // add convenient field reference
            model[key] = model.hasOwnProperty(key) ? model[key] : field.value;
        });
        return;
    }
    // otherwise, empty schema of values
    this.clear();
};

/**
 * Set field value in model schema.
 *
 * @param {String} field
 * @param {Object} data
 * @src public
 */

Model.prototype.setValue = function(field, value) {
    if (typeof field === 'string' && this.schema.fields.hasOwnProperty(field)) {
        this.schema.fields[field].value = value ? value : null;
    }
};

/**
 * Get field value from model schema.
 *
 * @param {String} field
 * @src public
 */

Model.prototype.getValue = function(field) {
    if (field) return this.schema.fields.hasOwnProperty(field) ? this.schema.fields[field].value : null;
};

/**
 * Get field value from model schema.
 *
 * @return {Object} filtered data
 * @src public
 */

Model.prototype.getData = function() {
    let filteredData = {};
    Object.entries(this.schema.fields).forEach(([key, field]) => {
        filteredData[key] = field.value;
    });
    return filteredData;
};

/**
 * Clear field values from model schema.
 *
 * @return {Model} for chaining
 * @src public
 */

Model.prototype.clear = function() {
    if (this.hasOwnProperty('schema')) {
        Object.entries(this.schema.fields).forEach(([_, field]) => {
            field.value = '';
        });
    }
    return this;
};

/**
 * Set options of provided schema field.
 *
 * @param {String} field
 * @param {Array} data
 * @src public
 */

Model.prototype.setOptions = function(field, options) {
    if (field && this.schema.fields.hasOwnProperty(field) && typeof options === 'object') {
        this.schema.fields[field].options = options ? options : null;
    }
};

/**
 * Create derived model through prototypal inheritance. The model schema
 * should have the following properties for fields:

 this.schema = {
    name: '<model_name>,
    label: '<model_label>',
    fields: {
        <field name>: {
            label: '<field label>',
            type: '<datatype>',
            render: {
                <view name>: {
                    attributes: {
                        type: '<input type>',
                        value: <default value>
                    }
                    validation: [<validation checklist>]
                    restrict: [<user role IDs>]
                    options: [<options>]
                },

            }
        }
    }
 }
 *
 * @param {Object} schema
 * @src public
 */

export function createModel(schema) {
    let derivedModel = function() {}
    derivedModel.prototype = Object.create(Model.prototype);
    derivedModel.prototype.schema = schema;
    derivedModel.prototype.name = schema.name;
    derivedModel.prototype.label = schema.label;
    derivedModel.prototype.pool = pool;
    return derivedModel;
}


