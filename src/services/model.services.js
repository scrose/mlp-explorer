/*!
 * MLP.API.Services.Construct.Model
 * File: model.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import { humanize, sanitize, toCamel } from '../lib/data.utils.js';
import * as schemaConstructor from './schema.services.js';
import { getNode } from './schema.services.js';

/**
 * Create derived model through composition. The model schema
 * should have the following properties for attributes:

 this.attributes: {
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
            writable: true
        },
        name: {
            value: toCamel(modelType),
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
            get: schema.getNode,
        },
        files: {
            value: null,
            writable: true
        },
        getAttachedFiles: {
            value: schema.getAttachedFiles,
            writable: false
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
        setDataOptions: {
            value: setDataOptions,
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
        //
        // console.log(this.attributes);

        // assert attributes exist in model schema
        Object.keys(inputData)
            .filter(key => !(this.attributes
                && this.attributes.hasOwnProperty(key)))
            .map(key => {console.log(key); throw Error('invalidInputData')});

        // set attribute values from data
        Object.keys(inputData)
            .filter(key => this.attributes && this.attributes.hasOwnProperty(key))
            .map(key => this.attributes[key].value =
                sanitize(inputData[key], this.attributes[key].type));

        // get attached files (if exist)
        this.files = this.getAttachedFiles(this.getId());
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
 * Get field values from model.
 *
 * @return {Object} filtered data
 * @src public
 */

function getData() {
    let filteredData = {};
    Object.entries(this.attributes).map(([key, field]) => {
        filteredData[key] = field.value;
    });
    return filteredData;
}

/**
 * Clear field values from model attributes.
 *
 * @return {object} for chaining
 * @src public
 */

function clear() {
    Object.entries(this.attributes).map(attr => { attr.value = null });
}

/**
 * Set options of provided schema field.
 *
 * @param {String} field
 * @param {Array} options
 * @src public
 */

function setDataOptions(field, options) {
    if (field
        && this.attributes.hasOwnProperty(field)
        && typeof options === 'object')
        this.attributes[field].options = options ? options : null;
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
 * Generates reference (lookup) object from given model type.
 *
 * @public
 * @params {Object} item
 * @return {Promise} result
 */

export const createReference = async function(id, item, modelType) {

    // generate node constructor
    let Reference = await create(modelType);

    // get owner attributes (if exist)
    let ownerAttrs = item.owner
        ? await getNode(item.owner.value)
        : { id: null, type: null }

    // return node instance: set owner attribute values from
    // retrieved node attributes
    return new Reference({
        id: id,
        type: item.table,
        owner_id: ownerAttrs.id,
        owner_type: ownerAttrs.type
    });
};

