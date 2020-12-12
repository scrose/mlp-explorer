/*!
 * MLP.API.Constructor.Model
 * File: model.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import { humanize, sanitize, toCamel } from '../lib/data.utils.js';
import * as schemaConstructor from './schema.services.js';

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
 * @param {String} modelType
 * @src public
 */

export const create = async (modelType) => {

    // generate schema for model type
    let Schema = await schemaConstructor.create(modelType);
    const schema = new Schema();

    // initialize model constructor
    let Model = function(attributeValues) {
        this.setData = setData;
        this.setData(attributeValues);
    };

    // define model properties
    Object.defineProperties(Model.prototype, {
        table: {
            value: modelType,
            writable: true,
        },
        name: {
            value: toCamel(modelType),
            writable: true,
        },
        label: {
            value: humanize(modelType),
            writable: true,
        },
        owners: {
            value: schema.owners,
            writable: true,
        },
        fields: {
            value: schema.attributes,
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
        hasOwners: {
            value: function() {
                return !!schema.owners.length
            },
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
        // select either first row of data array or single data object
        const inputData = data.hasOwnProperty('rows') ? data.rows[0] : data;
        Object.entries(inputData).forEach(([key, value]) => {
            console.log(self.label, ' field:', key, ', value:', value)
            // check that field exists in model
            if (!self.fields.hasOwnProperty(key)) throw Error('violatesSchema');
            console.log(self.fields[key].type, sanitize(value, self.fields[key].type))
            // TODO: check that field is correct type
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

