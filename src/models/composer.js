/*!
 * MLP.API.Models.Composer
 * File: composer.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import pool from '../services/pgdb.js';

/**
 * Create derived model through composition. The model schema
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
    let model = function (data) {
        this.setData = setData;
        this.setData(data);
    };
    Object.defineProperties(model.prototype, {
        name: {
            value: schema.name || null,
            writable: true
        },
        label: {
            value: schema.label || null,
            writable: true
        },
        schema: {
            value: schema,
            writable: true
        },
        pool: {
            value: pool,
            writable: true
        },
        getValue: {
            value: getValue,
            writable: false
        },
        setValue: {
            value: setValue,
            writable: false
        },
        getData: {
            value: getData,
            writable: false
        },
        setDataOptions: {
            value: setDataOptions,
            writable: false
        },
        clear: {
            value: clear,
            writable: false
        }
    });
    return model;
}



/**
 * Set values of model schema fields.
 *
 * @param {Object} data
 * @src public
 */

export const setData = function (data) {
        const self = this;
        if (typeof data === 'object' && data !== null) {
            const inputData = data.hasOwnProperty('rows') ? data.rows[0] : data;
            Object.entries(inputData).forEach(([key, field]) => {
                if (!self.schema.fields.hasOwnProperty(key)) throw Error();
                self.schema.fields[key].value = field
            });
        } else {
            // default constructor
            Object.entries(self.schema.fields).forEach(([_, field]) => {
                field.value = '';
            });
        }
    }



/**
 * Set field value in model schema.
 *
 * @param {String} field
 * @param {Object} value
 * @src public
 */

export const setValue = function (field, value) {
    if (typeof field === 'string' && this.schema.fields.hasOwnProperty(field)) {
        this.schema.fields[field].value = value ? value : null;
    }
};

/**
 * Get field value from model schema.
 *
 * @param {String} field
 * @return {Object} field data
 * @src public
 */

export const getValue = function (field) {
    if (field) return this.schema.fields.hasOwnProperty(field) ? this.schema.fields[field].value : null;
};

/**
 * Get field value from model schema.
 *
 * @return {Object} filtered data
 * @src public
 */

export const getData = function () {
    let filteredData = {};
    Object.entries(this.schema.fields).forEach(([key, field]) => {
        filteredData[key] = field.value;
    });
    return filteredData;
};

/**
 * Clear field values from model schema.
 *
 * @return {object} for chaining
 * @src public
 */

export const clear = function () {
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
 * @param {Array} options
 * @src public
 */

export const setDataOptions = function (field, options) {
    if (field && this.schema.fields.hasOwnProperty(field) && typeof options === 'object') {
        this.schema.fields[field].options = options ? options : null;
    }
};

