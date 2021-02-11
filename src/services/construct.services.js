/*!
 * MLP.API.Services.Construct.Model
 * File: construct.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import { humanize, sanitize } from '../lib/data.utils.js';
import * as schemaConstructor from './schema.services.js';
import { select } from './nodes.services.js';

/**
 * Create derived model through composition. The model schema
 * should have attributes that match the database table.
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
            writable: true
        },
        name: {
            value: modelType,
            writable: true
        },
        key: {
            value: `${modelType}_id`,
            writable: true
        },
        label: {
            value: humanize(modelType),
            writable: true
        },
        attributes: {
            value: schema.attributes,
            writable: true
        },
        node: {
            get: schema.getNode
        },
        owner: {
            get: schema.getOwner,
        },
        attached: {
            get: schema.getAttached,
        },
        idKey: {
            value: schema.idKey,
            writable: false
        },
        id: {
            get: getId(schema.idKey),
        },
        setId: {
            value: setId(schema.idKey)
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
        setOwner: {
            value: schema.setOwner,
            writable: false
        },
        setOptions: {
            value: setOptions,
            writable: false
        },
        clear: {
            value: clear,
            writable: false
        }
    });
    return Model;
};


/**
 * Set values of model schema attributes.
 *
 * @param {Object} data
 * @src public
 */

function setData(data=null) {

    // select object-defined data
    if (typeof data === 'object' && data !== null) {

        // select either first row of data array or single data object
        // NOTE: model can only hold data for single record
        const inputData = data.hasOwnProperty('rows') ? data.rows[0] : data;

        // assert attributes exist in model schema
        Object.keys(inputData)
            .filter(key => !(this.attributes
                && this.attributes.hasOwnProperty(key)))
            .map(key => {
                console.error(`Attribute key \'${key}\' was not found in model schema.`);
                throw Error('schemaMismatch')
            });

        // set attribute values from data
        Object.keys(inputData)
            .filter(key => this.attributes && this.attributes.hasOwnProperty(key))
            .map(key => this.attributes[key].value =
                sanitize(inputData[key], this.attributes[key].type));
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
    if (typeof key === 'string' && this.attributes.hasOwnProperty(key)) {
        this.attributes[key].value = sanitize(value, this.attributes[key].type);
    }
}

/**
 * Get ID value in model schema.
 *
 * @param {String} key (identifier key)
 * @src public
 */

function getId(key) {
    return function () {return this.attributes[key].value};
}

/**
 * Set ID value for model.
 *
 * @param {String} key (identifier key)
 * @src public
 */

function setId(key) {
    return function (id) {this.attributes[key].value = id};
}

/**
 * Get field value from model attributes.
 *
 * @param {String} field
 * @return {Object} field data
 * @src public
 */

function getValue(field=null) {
    return field && this.attributes.hasOwnProperty(field)
        ? this.attributes[field].value
        : null;
}

/**
 * Get field values from model. Optional filter array
 * omits select attributes from result.
 *
 * @return {Object} filtered data
 * @param {Array} filter
 * @src public
 */

function getData(filter=[]) {
    return Object.keys(this.attributes)
        .filter(key => !filter.includes(key))
        .reduce((o, key) => {
            o[key] = this.attributes[key].value; return o
        }, {});
}

/**
 * Clear field values from model attributes.
 *
 * @return {object} for chaining
 * @src public
 */

function clear() {
    Object.entries(this.attributes)
        .map(attr => { attr.value = null });
}

/**
 * Set options of provided schema field.
 *
 * @param {String} key
 * @param {Array} options
 * @src public
 */

function setOptions(key, options=[]) {
    if (key
        && this.attributes.hasOwnProperty(key)
        && typeof options === 'object')
        this.attributes[key].options = options;
}


/**
 * Generates nodes object from given model instance.
 *
 * @public
 * @params {Object} item
 * @return {Promise} result
 */

export const createNode = async function(item) {

    if (!item.node) return null;

    // generate node model object
    return await createReference(item.node.value, item, 'nodes');
};

/**
 * Generates files object from given model instance.
 *
 * @public
 * @params {Object} item
 * @return {Promise} result
 */

export const createFile = async function(item) {

    if (!item.file) return null;

    // generate file model object
    return await createReference(item.file.value, item, 'files');
};

/**
 * Generates reference object (e.g. node or file) for given model type.
 *
 * @public
 * @params {integer} id
 * @params {Object} item
 * @params {String} type
 * @return {Promise} result
 */

export const createReference = async function(id, item, type) {

    // generate reference constructor
    let Reference = await create(type);

    // get owner attributes (if exist)
    let ownerAttrs = item.owner
        ? await select(item.owner.value)
        : { id: null, type: null };

    console.log(item.getData())



    // return node instance: set owner attribute values from
    // retrieved node attributes
    return new Reference({
        id: id,
        type: item.table,
        owner_id: ownerAttrs.id,
        owner_type: ownerAttrs.type
    });
};
