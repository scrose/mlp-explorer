/*!
 * MLP.API.Services.Construct
 * File: construct.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import { humanize, sanitize } from '../lib/data.utils.js';
import * as schemaConstructor from './schema.services.js';
import { select as nselect } from './nodes.services.js';
import { select as fselect } from './files.services.js';

/**
 * Create derived model through composition. The model schema
 * should have attributes that match the database table.
 *
 * @param {String} modelType
 * @src public
 */

export const create = async (modelType) => {

    // generate schema for constructor type
    let Schema = await schemaConstructor.create(modelType);
    const schema = new Schema();

    // return constructor
    return function(attributeValues) {

        // static variables
        this.name = modelType;
        this.key = `${modelType}_id`;
        this.idKey = schema.idKey;
        this.label = humanize(modelType);
        this.attributes = schema.attributes;

        // initialize model with input data
        this.setData = setData;
        this.setData(attributeValues);

        // method definitions
        Object.defineProperties(this, {

            /**
             * Get/set node/file id value.
             *
             * @return {Object} field data
             * @src public
             */

            id: {
                get: () => {
                    return this.attributes[schema.idKey].value;
                },
                set: (id) => {
                    this.attributes[schema.idKey].value = id;
                }
            },

            /**
             * Check for existence of attribute in model.
             *
             * @return {Object} field data
             * @src public
             */

            hasAttribute: {
                value: (attr) => {
                    return schema.attributes.hasOwnProperty(attr);
                },
                writable: true
            },

            /**
             * Get the nodes reference data (if exists).
             *
             * @return {Object} field data
             * @src public
             */

            node: {
                get: () => {
                    return schema.attributes.hasOwnProperty('nodes_id')
                        ? this.attributes['nodes_id']
                        : null;
                },
                set: (data) => {
                    if (schema.attributes.hasOwnProperty('nodes_id'))
                        this.attributes['nodes_id'].data = data;
                }
            },

            /**
             * Get/set the files reference data (if exists).
             *
             * @return {Object} field data
             * @src public
             */

            file: {
                get: () => {
                    return schema.attributes.hasOwnProperty('files_id')
                        ? this.attributes['files_id']
                        : null;
                },
                set: (data) => {
                    if (schema.attributes.hasOwnProperty('files_id'))
                        this.attributes['files_id'].data = data;
                }
            },

            /**
             * Get/set the node/file owner data.
             *
             * @return {Object} field data
             * @src public
             */

            owner: {
                get: () => {
                    return schema.attributes.hasOwnProperty('owner_id')
                        ? this.attributes['owner_id']
                        : null;
                },
                set: (id) => {
                    if (typeof id === 'string' && this.attributes.hasOwnProperty('owner_id')) {
                        this.attributes['owner_id'].value = sanitize(id);
                    }
                }
            },

            /**
             * Get attached references (if they exist).
             *
             * @param {String} field
             * @return {Object} field data
             * @src public
             */

            attached: {
                get: () => {
                    const attached = Object.keys(this.attributes)
                        .filter(key => this.attributes[key].ref && this.attributes[key].ref !== 'nodes')
                    return attached.length === 0 ? null : attached;
                }
            },

            /**
             * Get field value from model attributes.
             *
             * @param {String} field
             * @return {Object} field data
             * @src public
             */

            getValue: {
                value: (field=null) => {
                    return field && this.attributes.hasOwnProperty(field)
                        ? this.attributes[field].value
                        : null;
                },
                writable: false
            },

            /**
             * Set field value in model schema.
             *
             * @param {String} key
             * @param {Object} value
             * @src public
             */

            setValue: {
                value: (key, value) => {
                    if (typeof key === 'string' && this.attributes.hasOwnProperty(key)) {
                        this.attributes[key].value = sanitize(value, this.attributes[key].type);
                    }
                },
                writable: false
            },

            /**
             * Get field values from model. Optional filter array
             * omits select attributes from result.
             *
             * @return {Object} filtered data
             * @param {Array} filter
             * @src public
             */

            getData: {
                value: (filter=[]) => {
                    return Object.keys(this.attributes)
                        .filter(key => !filter.includes(key))
                        .reduce((o, key) => {
                            o[key] = this.attributes[key].value; return o
                        }, {});
                },
                writable: false
            },

            /**
             * Set options of provided schema field.
             *
             * @param {String} key
             * @param {Array} options
             * @src public
             */

            setOptions: {
                value: (key, options=[]) => {
                    if (key
                        && this.attributes.hasOwnProperty(key)
                        && typeof options === 'object')
                        this.attributes[key].options = options;
                },
                writable: false
            },

            /**
             * Clear attributes of all values.
             *
             * @param {String} key
             * @param {Array} options
             * @src public
             */

            clear: {
                value: () => {
                    this.attributes = Object.keys(this.attributes)
                        .map(key => {
                            this.attributes[key].value = null;
                        });
                },
                writable: false
            }
        });
    }
};

/**
 * Set values of model attributes.
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
 * Generates node object from given model instance.
 *
 * @public
 * @params {Object} item
 * @return {Promise} result
 */

export const createNode = async function(item) {

    if (!item.node) return null;

    // generate node constructor
    let Node = await create('nodes');

    // get owner attributes (if exist)
    let ownerAttrs = item.owner
        ? await nselect(item.owner.value)
        : { id: null, type: null };

    // return node instance: set owner attribute values from
    // retrieved node attributes
    return new Node({
        id: item.id,
        type: item.name,
        owner_id: ownerAttrs.id,
        owner_type: ownerAttrs.type
    });
};

/**
 * Generates file object from given model instance
 * and file metadata.
 *
 * @public
 * @params {Object} item
 * @return {Promise} result
 */

export const createFile = async function(item) {

    if (!item.file) return null;

    // generate file constructor
    let File = await create('files');

    // get owner attributes (if exist)
    let ownerAttrs = item.owner
        ? await nselect(item.owner.value)
        : { id: null, type: null };

    // get additional file metadata from item
    const { data={} } = item.file || {};
    const { filename='', mime_type='' } = data || {};

    // return node instance: set owner attribute values from
    // retrieved node attributes
    return new File({
        id: item.id,
        file_type: item.name,
        filename: filename,
        mimetype: mime_type,
        owner_id: ownerAttrs.id,
        owner_type: ownerAttrs.type
    });
};