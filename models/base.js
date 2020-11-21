/*!
 * MLP.Core.Models.Base
 * File: /models/base.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const utils = require('../lib');

/**
 * Module exports.
 * @public
 */

module.exports = Model

/**
 * Abstract base prototype for data models. The model schema
 * should have the following properties for fields:

 this.schema = {
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
 * @api private
 * @param {String} name
 * @param {String} label
 * @param {Object} schema
 * @param {Object} data
 */

function Model(name, label, schema=null, data = null) {
    Object.defineProperty(this, 'name', {
        value: name,
        writable: false
    });
    Object.defineProperty(this, 'label', {
        value: label,
        writable: false
    });
    Object.defineProperty(this, 'schema', {
        value: schema,
        writable: false
    });
    Object.defineProperty(this, 'data', {
        value: data,
        writable: false
    });

    const self = this;

    // merge data into schema
    if (typeof data === 'object' && data !== null) {
        const inputData = (data.hasOwnProperty('rows')) ? data.rows[0] : data;
        Object.entries(self.schema.fields).forEach(([key, field]) => {
            field.value = inputData.hasOwnProperty(key) ? inputData[key] : null;
        });
    } else {
        Object.entries(self.schema.fields).forEach(([key, field]) => {
            field.value = '';
        });
    }
}

/**
 * Set values of model schema fields.
 *
 * @param {Object} data
 * @api public
 */

utils.obj.defineMethod(Model, 'setData', function (data) {
    // set data values in schema
    if (typeof data === 'object') {
        const inputData = (data.hasOwnProperty('rows')) ? data.rows[0] : data;
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
});

/**
 * Set field value in model schema.
 *
 * @param {String} field
 * @param {Object} data
 * @api public
 */

utils.obj.defineMethod(Model, 'setValue', function(field, value) {
    if (typeof field === 'string' && this.schema.fields.hasOwnProperty(field)) {
        this.schema.fields[field].value = value ? value : null;
    }
});


/**
 * Get field value from model schema.
 *
 * @param {String} field
 * @api public
 */

utils.obj.defineMethod(Model, 'getValue', function(field) {
    if (field) return (this.schema.fields.hasOwnProperty(field))
        ? this.schema.fields[field].value
        : null;
});

/**
 * Get field value from model schema.
 *
 * @return {Object} filtered data
 * @api public
 */

utils.obj.defineMethod(Model, 'getData', function () {
    let filteredData = {}
    Object.entries(this.schema.fields).forEach(([key, field]) => {
        filteredData[key] = field.value;
    });
    return filteredData;
});


/**
 * Clear field values from model schema.
 *
 * @return {Model} for chaining
 * @api public
 */

utils.obj.defineMethod(Model, 'clear', function () {
    if (this.hasOwnProperty('schema')) {
        Object.entries(this.schema.fields).forEach(([key, field]) => {
            field.value = '';
        });
    }
    return this;
});

/**
 * Set options of provided schema field.
 *
 * @param {String} field
 * @param {Array} data
 * @api public
 */

utils.obj.defineMethod(Model, 'setOptions', function(field, options) {
    if (field && this.schema.fields.hasOwnProperty(field) && typeof options === 'object') {
        this.schema.fields[field].options = (options) ? options : null;
    }
});
