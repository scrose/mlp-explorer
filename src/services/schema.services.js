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
import { humanize } from '../lib/data.utils.js';

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
    const attributes = await getAttributes(constructorType);
    const nodeAttributes = await getAttributes('nodes');
    const fileAttributes = await getAttributes('files');

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
        nodeAttributes: {
            value: nodeAttributes || [],
            writable: true
        },
        fileAttributes: {
            value: fileAttributes || [],
            writable: true
        },
        idKey: {
            value: idKey,
            writable: false
        },
        permissions: {
            value: permissions[constructorType],
            writable: false
        },
        rootNodeTypes: {
            value: ['projects', 'surveyors'],
            writable: false
        },
        nodeDepth: {
            value: {
                'projects': 0,
                'surveyors': 0,
                'surveys': 0,
                'survey_seasons': 1,
                'default': 2
            },
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

export const getNodeTypes = async function(client=pool) {
    let { sql, data } = queries.nodes.types();
    let nodeTypes = await client.query(sql, data);

    // return only model type names as list
    return nodeTypes.rows.map(nodeType => { return nodeType.name });
};

/**
 * Get all file types.
 *
 * @public
 * @return {Promise} result
 */

export const getFileTypes = async function(client=pool) {
    let { sql, data } = queries.files.types();
    let fileTypes = await client.query(sql, data);

    // return only model type names as list
    return fileTypes.rows.map(fileType => { return fileType.name });
};

/**
 * Find and format schema attributes for given model or reference type.
 *
 * @public
 * @param {String} type
 * @param client
 * @return {Promise} result
 */

export const getAttributes = async function(type, client=pool) {

    if (type == null) return null;

    // get model attributes (table columns)
    let {sql, data} = queries.schema.getColumns(type);
    const attrs = await client.query(sql, data);

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

export const getPermissions = async function(client=pool) {

    let { sql, data } = queries.users.getPermissions();
    let permissions = await client.query(sql, data);
    return permissions.rows;
};



