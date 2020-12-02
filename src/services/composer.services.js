/*!
 * MLP.API.Models.Composer
 * File: composer.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import { humanize } from '../lib/data.utils.js';
import pool from './pgdb.js';
import * as queries from './queries/schema.queries.js';

/**
 * Get table column information.
 *
 * @public
 * @param {String} table
 * @return {Promise} result
 */

export async function getSchema(table) {
    return pool.query(
        queries.getColumnsInfo,
        [table],
    );
}

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
 * @param {String} table
 * @src public
 */

export const create = async (table) => {

    // initialize model
    let model = function(data) {
        this.setData = setData;
        this.setData(data);
    };

    // initialize schema
    let schema = {fields:{}};

    // generate schema from table column data
    await getSchema(table)
            .then((data) => {
                // schematize table columns as data fields
                data.rows
                    .forEach((col) => {
                        schema.fields[col.column_name] = {
                            label: humanize(col.column_name),
                            type: col.data_type,
                            restrict: [],
                            render: {
                                create: {
                                    validation: [],
                                },
                                edit: {
                                    validation: [],
                                },
                                remove: {
                                    validation: [],
                                },
                            },
                        };
                    });
            })
            .catch(() => {throw new Error('schema')})

    // define model properties
    Object.defineProperties(model.prototype, {
        name: {
            value: table || null,
            writable: true,
        },
        label: {
            value: humanize(table) || null,
            writable: true,
        },
        schema: {
            value: schema,
            writable: true,
        },
        getValue: {
            value: getValue,
            writable: false,
        },
        setValue: {
            value: setValue,
            writable: false,
        },
        getData: {
            value: getData,
            writable: false,
        },
        setDataOptions: {
            value: setDataOptions,
            writable: false,
        },
        clear: {
            value: clear,
            writable: false,
        },
    });
    return model;
};


/**
 * Set values of model schema fields.
 *
 * @param {Object} data
 * @src public
 */

export const setData = function(data) {
    const self = this;
    if (typeof data === 'object' && data !== null) {
        const inputData = data.hasOwnProperty('rows') ? data.rows[0] : data;
        Object.entries(inputData).forEach(([key, field]) => {
            if (!self.schema.fields.hasOwnProperty(key)) throw Error('schema');
            self.schema.fields[key].value = field;
        });
    } else {
        // default constructor
        Object.entries(self.schema.fields).forEach(([_, field]) => {
            field.value = '';
        });
    }
};


/**
 * Set field value in model schema.
 *
 * @param {String} field
 * @param {Object} value
 * @src public
 */

export const setValue = function(field, value) {
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

export const getValue = function(field) {
    if (field) return this.schema.fields.hasOwnProperty(field) ? this.schema.fields[field].value : null;
};

/**
 * Get field value from model schema.
 *
 * @return {Object} filtered data
 * @src public
 */

export const getData = function() {
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

export const clear = function() {
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

export const setDataOptions = function(field, options) {
    if (field && this.schema.fields.hasOwnProperty(field) && typeof options === 'object') {
        this.schema.fields[field].options = options ? options : null;
    }
};

