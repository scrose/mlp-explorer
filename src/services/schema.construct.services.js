/*!
 * MLP.API.Services.Schema
 * File: schema.construct.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import pool from './pgdb.js';
import queries from './queries/index.queries.js';
import { groupBy, humanize } from '../lib/data.utils.js';

/**
 * Export schema constructor. A schema instance is a
 * wrapper to serve table information about a model.
 *
 * @public
 * @return {Promise} result
 */

export const create = async (modelType) => {
    const modelTypes = await getTypes();
    const permissions = await getPermissions();
    const attributes = await getModelAttributes(modelType);

    console.log('Create Model', attributes)

    // check model definition
    if (!(modelTypes.includes(modelType) || modelType === 'nodes'))
        throw Error('modelNotDefined');

    // construct schema for model type
    let Schema = function() {
        this.model = modelType;
    };

    // define model properties
    Object.defineProperties(Schema.prototype, {
        types: {
            value: modelTypes,
            writable: true
        },
        attributes: {
            value: attributes,
            writable: false
        },
        getNode: {
            value: function() {
                const node = Object.entries(this.attributes)
                    .find(([key, _]) => key === 'nodes_id'
                        && this.attributes[key].ref);
                return node == null ? null : node[1];
            },
            writable: false
        },
        getOwner: {
            value: function() {
                const owner = Object.entries(this.attributes)
                    .find(([key, _]) => key === 'owner_id'
                        && this.attributes[key].ref);
                return owner == null ? null : owner[1];
            },
            writable: false
        },
        getAttached: {
            value: function() {
                const attached = Object.entries(this.attributes)
                    .filter(([key, _]) => this.attributes[key].ref
                        && this.attributes[key].ref !== 'nodes')
                return attached.length === 0 ? null : attached;
            },
            writable: false
        },
        permissions: {
            value: permissions[modelType],
            writable: false
        },
    });
    return Schema;
};

/**
 * Get all model types.
 *
 * @public
 * @return {Promise} result
 */

export const getTypes = async function() {
    let { sql, data } = queries.schema.getModelTypes();
    let modelTypes = await pool.query(sql, data);

    // return only model type names as list
    return modelTypes.rows.map(modelType => { return modelType.name });
};

/**
 * Get node by ID. NOTE: returns single object.
 *
 * @public
 * @param {integer} id
 * @return {Promise} result
 */

export const getNode = async function(id) {
    let { sql, data } = queries.schema.getNode(id);
    let node = await pool.query(sql, data);
    return node.rows[0];
};

/**
 * Find and format model schema attributes.
 *
 * @public
 * @param {String} modelType
 * @return {Promise} result
 */

export const getModelAttributes = async function(modelType) {

    console.log('Modeltype:', modelType)

    if (modelType == null) return null;

    // get model attributes (table columns)
    let {sql, data} = queries.schema.getColumns(modelType);
    const attrs = await pool.query(sql, data);

    // no attributes found
    if (attrs.rows.length === 0) return null;

    // index attributes by name
    return attrs.rows
        .reduce(function(rv, x) {
            (rv[x.col] = {
                value: null,
                key: x.col,
                label: humanize(x.col),
                type: x.data_type,
                ref: x.ref_table,
                // refId: x.ref_col
            } || []);
            return rv;
        }, {});
};

/**
 * Get user permissions. Returns object with user role restrictions
 * indexed by model type.
 *
 * @public
 * @return {Promise} result
 */

export const getPermissions = async function() {

    let { sql, data } = queries.schema.getPermissions();
    let permissions = await pool.query(sql, data);

    // group permissions by model
    permissions = groupBy(permissions.rows, 'model');

    // rename "null" key to "default"
    Object.defineProperty(permissions, 'default',
        Object.getOwnPropertyDescriptor(permissions, 'null'));
        delete permissions['null'];

    return permissions;
};



