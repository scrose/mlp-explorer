/*!
 * MLP.API.Services.Model
 * File: model.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import { humanize, sanitize, toCamel, toSnake } from '../lib/data.utils.js';
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

 this.fields: {
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

    // initialize model constructor
    let Model = function(data) {
        this.table = table;
        this.name = toCamel(table);
        this.label = humanize(table);
        this.setData = setData;
        this.setData(data);
    };

    // initialize schema
    let fields = {};

    // generate schema from table column data
    await getSchema(table)
        .then((data) => {
            // schematize table columns as data fields
            data.rows
                .forEach((col) => {
                    fields[col.column_name] = {
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
        .catch((err) => {
            throw err;
        });

    // define model properties
    Object.defineProperties(Model.prototype, {
        name: {
            value: table || null,
            writable: true,
        },
        label: {
            value: humanize(table) || null,
            writable: true,
        },
        fields: {
            value: fields,
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
    return Model;
};


/**
 * Set values of model schema fields.
 *
 * @param {Object} data
 * @src public
 */

function setData(data=null) {
    const self = this;
    if (typeof data === 'object' && data !== null) {
        const inputData = data.hasOwnProperty('rows') ? data.rows[0] : data;
        Object.entries(inputData).forEach(([key, value]) => {
            if (!self.fields.hasOwnProperty(key)) throw Error('schema');
            self.fields[key].value = sanitize(value, self.fields[key].type);
        });
    } else {
        // default constructor
        Object.entries(self.fields).forEach(([key, field]) => {
            field.value = sanitize(null, self.fields[key].type);
        });
    }
}

/**
 * Set field value in model schema.
 *
 * @param {String} key
 * @param {Object} value
 * @src public
 */

function setValue(key, value) {
    if (typeof key === 'string' && this.fields.hasOwnProperty(key)) {
        this.fields[key].value = sanitize(value, this.fields[key].type);
    }
}

/**
 * Get field value from model schema.
 *
 * @param {String} field
 * @return {Object} field data
 * @src public
 */

function getValue(field) {
    if (field) return this.fields.hasOwnProperty(field) ? this.fields[field].value : null;
}

/**
 * Get field value from model schema.
 *
 * @return {Object} filtered data
 * @src public
 */

function getData() {
    let filteredData = {};
    Object.entries(this.fields).forEach(([key, field]) => {
        filteredData[key] = field.value;
    });
    return filteredData;
}

/**
 * Clear field values from model schema.
 *
 * @return {object} for chaining
 * @src public
 */

function clear() {
    if (this.hasOwnProperty('schema')) {
        Object.entries(this.fields).forEach(([_, field]) => {
            field.value = '';
        });
    }
    return this;
}

/**
 * Set options of provided schema field.
 *
 * @param {String} field
 * @param {Array} options
 * @src public
 */

function setDataOptions(field, options) {
    if (field && this.fields.hasOwnProperty(field) && typeof options === 'object') {
        this.fields[field].options = options ? options : null;
    }
}

