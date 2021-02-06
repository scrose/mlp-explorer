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

import pool from './db.services.js';
import queries from '../queries/index.queries.js';
import { groupBy, humanize } from '../lib/data.utils.js';
import { sanitize } from '../lib/data.utils.js';

/**
 * Export schema constructor. A schema instance is a
 * wrapper to serve table information about a model.
 *
 * @public
 * @param {String} constructorType
 * @return {Object} constructor
 */

export const create = async (constructorType) => {

    // initialize db schema attributes
    const nodeTypes = await getNodeTypes();
    const fileTypes = await getFileTypes();
    const permissions = await getPermissions();
    const attributes = await getModelAttributes(constructorType);

    // check type definition in db. The 'nodes' model includes all
    // data containers (e.g. historic visits); the 'files'
    // model handles all nodes attached to files in the library
    // (e.g. historic images).
    if (
        !(nodeTypes.includes(constructorType)
            || fileTypes.includes(constructorType)
            || constructorType === 'nodes'
            || constructorType === 'files')
    )
        throw Error('invalidConstructorType');

    // set identifier key based on model attributes.
    const idKey =
        (attributes == null || attributes.hasOwnProperty('files_id'))
            ? 'files_id'
            : attributes.hasOwnProperty('nodes_id')
            ? 'nodes_id'
            : 'id';

    // construct schema for model type
    let Schema = function() {
        this.model = constructorType;
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
        getOwner: {
            value: function() {
                const owner = Object.keys(this.attributes)
                    .find(key => key === 'owner_id'
                        && this.attributes[key].ref);
                return owner == null ? null : this.attributes[owner];
            },
            writable: false
        },
        setOwner: {
            value: function(ownerModel, id) {
                // set owner attributes in model instance
                if (typeof id === 'string' && this.attributes.hasOwnProperty('owner_id')) {
                    this.attributes['owner_id'].value = sanitize(id);
                }
            }
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
            value: permissions[constructorType],
            writable: false
        }
    });
    return Schema;
};

/**
 * Get all node types.
 *
 * @public
 * @return {Promise} result
 */

export const getNodeTypes = async function() {
    let { sql, data } = queries.nodes.types();
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
    let { sql, data } = queries.files.types();
    let fileTypes = await pool.query(sql, data);

    // return only model type names as list
    return fileTypes.rows.map(fileType => { return fileType.name });
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
    let {sql, data} = queries.schema.getColumns(modelType);
    const attrs = await pool.query(sql, data);

    // no attributes found
    if (attrs.rows.length === 0) return null;

    // index attributes by their names
    return attrs.rows
        .reduce((o, x) => {
            (o[x.col] = {
                value: null,
                key: x.col,
                label: humanize(x.col),
                type: x.data_type,
                ref: x.ref_table
                // refId: x.ref_col
            } || []);
            return o;
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

    let { sql, data } = queries.users.getPermissions();
    let permissions = await pool.query(sql, data);

    // group permissions by model
    permissions = groupBy(permissions.rows, 'model');

    // rename "null" key to "default"
    Object.defineProperty(permissions, 'default',
        Object.getOwnPropertyDescriptor(permissions, 'null'));
        delete permissions['null'];

    return permissions;
};



