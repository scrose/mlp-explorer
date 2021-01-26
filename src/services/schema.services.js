/*!
 * MLP.API.Services.Schema
 * File: schema.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import pool from './pgdb.js';
import queries from '../queries/index.queries.js';
import { groupBy, humanize } from '../lib/data.utils.js';

/**
 * Export schema constructor. A schema instance is a
 * wrapper to serve table information about a model.
 *
 * @public
 * @return {Promise} result
 */

export const create = async (modelType) => {
    const nodeTypes = await getNodeTypes();
    const fileTypes = await getFileTypes();
    const permissions = await getPermissions();
    const attributes = await getModelAttributes(modelType);

    // check model definition in db. The 'nodes' model includes all
    // data containers (e.g. historic visits); the 'files'
    // model handles all nodes attached to files in the library
    // (e.g. historic images).

    if (!(nodeTypes.includes(modelType) || fileTypes.includes(modelType)
        || modelType === 'nodes' || modelType === 'files'))
        throw Error('modelNotDefined');

    // set identifier key based on model attributes.
    const idKey =
        (attributes == null || attributes.hasOwnProperty('files_id'))
            ? 'files_id'
            : attributes.hasOwnProperty('nodes_id')
            ? 'nodes_id'
            : 'id';

    // construct schema for model type
    let Schema = function() {
        this.model = modelType;
    };

    // define model properties
    Object.defineProperties(Schema.prototype, {
        nodeTypes: {
            value: nodeTypes,
            writable: false
        },
        fileTypes: {
            value: fileTypes,
            writable: false
        },
        attributes: {
            value: attributes || [],
            writable: true
        },
        idKey: {
            value: idKey,
            writable: false
        },
        getNode: {
            value: function() {
                const node = Object.keys(this.attributes)
                    .find(key => key === 'nodes_id'
                        && this.attributes[key].ref);
                return node == null ? null : this.attributes[node];
            },
            writable: false
        },
        getFile: {
            value: function() {
                const file = Object.keys(this.attributes)
                    .find(key => key === 'files_id'
                        && this.attributes[key].ref);
                return file == null ? null : this.attributes[file];
            },
            writable: false
        },
        getOwner: {
            value: function() {
                const owner = Object.keys(this.attributes)
                    .find(key => key === 'owner_id'
                        && this.attributes[key].ref);
                return owner == null ? null : this.attributes[owner];
            },
            writable: false
        },
        getAttachedFiles: {
            value: function() {
                const attached = Object.keys(this.attributes)
                    .filter(key => this.attributes[key].ref
                        && this.attributes[key].ref !== 'nodes')
                return attached.length === 0 ? null : attached;
            },
            writable: false
        },
        getAttached: {
            value: function() {
                const attached = Object.keys(this.attributes)
                    .filter(key => this.attributes[key].ref
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

export const getNodeTypes = async function() {
    let { sql, data } = queries.nodes.getNodeTypes();
    let nodeTypes = await pool.query(sql, data);

    // return only model type names as list
    return nodeTypes.rows.map(nodeType => { return nodeType.name });
};

/**
 * Get all file types.
 *
 * @public
 * @return {Promise} result
 */

export const getFileTypes = async function() {
    let { sql, data } = queries.nodes.getFileTypes();
    let fileTypes = await pool.query(sql, data);

    // return only model type names as list
    return fileTypes.rows.map(fileType => { return fileType.name });
};

/**
 * Get file record by ID. NOTE: returns single object.
 *
 * @public
 * @param {integer} id
 * @return {Promise} result
 */

export const getFile = async function(id) {
    let { sql, data } = queries.nodes.getFile(id);
    let file = await pool.query(sql, data);
    return file.rows[0];
};

/**
 * Get file records attached to node.
 *
 * @public
 * @param {integer} owner_id
 * @return {Promise} result
 */

export const getAttachedFiles = async function(owner_id) {
    let { sql, data } = queries.nodes.getAttachedFiles(owner_id);
    let res = await pool.query(sql, data);
    return res.rows;
};

/**
 * Find and format model schema attributes.
 *
 * @public
 * @param {String} modelType
 * @return {Promise} result
 */

export const getModelAttributes = async function(modelType) {

    if (modelType == null) return null;

    // get model attributes (table columns)
    let {sql, data} = queries.nodes.getColumns(modelType);
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
                ref: x.ref_table
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

    let { sql, data } = queries.nodes.getPermissions();
    let permissions = await pool.query(sql, data);

    // group permissions by model
    permissions = groupBy(permissions.rows, 'model');

    // rename "null" key to "default"
    Object.defineProperty(permissions, 'default',
        Object.getOwnPropertyDescriptor(permissions, 'null'));
        delete permissions['null'];

    return permissions;
};



