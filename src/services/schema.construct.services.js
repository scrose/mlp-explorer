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
    const attrs = await getModelAttributes(modelType);

    console.log('Attributes: ', attrs)

    // check model definition
    if (!modelTypes.includes(modelType))
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
            value: attrs.attributes,
            writable: false
        },
        refs: {
            value: attrs.attached,
            writable: false
        },
        node: {
            value: attrs.node,
            writable: false
        },
        owner: {
            value: attrs.owner,
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
 * Find and format model schema attributes.
 *
 * @public
 * @param {String} modelType
 * @return {Promise} result
 */

export const getModelAttributes = async function(modelType) {

    if (modelType == null) return null;

    let refs = {
        attributes: null,
        node: null,
        owner: null,
        attached: null
    }

    // get model attributes (table columns)
    let {sql, data} = queries.schema.getColumns(modelType);
    const attrs = await pool.query(sql, data);

    // no attributes found
    if (attrs.rows.length === 0) return attributes;

    // filter nodes reference
    attrs.rows
        .find(attr => {
            return attr.fk_table === 'nodes' && attr.col === 'nodes_id';
        })
        .map(function() {
            refs.node =  createNode();
        });

    // filter owner reference
    attrs.rows
        .find(attr => {
            return attr.fk_table === 'nodes' && attr.col === 'owner_id';
        })
        .map(attr => {
            refs.owner = {
                id: attr.col,
                label: humanize(attr.col),
                type: attr.type,
                reference: attr.fk_table,
            };
        });

    // filter attached references
    refs.attached = attrs.rows
        .filter(attr => {
            return attr.fk_table && attr.fk_table !== 'nodes';
        })
        .reduce(function(attr, x) {
            (attr[x['col']] = {
                id: attr.col,
                label: humanize(attr.col),
                type: attr.type,
                reference: attr.fk_table,
            } || []).push(x);
            return attr;
        }, {});

    // filter non-referenced attributes
    refs.attributes = attrs.rows
        .filter(attr => {
            return !attr.fk_table && attr.fk_table !== 'nodes';
        })
        .reduce(function(attr, x) {
            (attr[x['col']] = {
                id: attr.col,
                label: humanize(attr.col),
                type: attr.type,
                reference: attr.fk_table,
            } || []).push(x);
            return attr;
        }, {});

    return refs;
};

/**
 * Generates simple node object to attach to model schema.
 *
 * @public
 * @params {Object} ref
 * @return {Promise} result
 */

export const createNode = async function() {

    let node = {
        table:'nodes',
        attributes: {}
    };

    // get node schema info
    let {sql, data} = queries.schema.getModel('nodes');
    let nodeSchema = await pool.query(sql, data);

    // generate node schema from table column data
    nodeSchema.rows
        .forEach(col => {
            node.attributes[col.column_name] = {
                type: col.data_type,
            };
        });

    // define method to get ID key
    Object.defineProperties(node, {
        getIdKey: {
            value: function() {return 'id'},
            writable: false
        },
        getId: {
            value: function() {return this.attributes.id.value;},
            writable: false
        },
        setId: {
            value: function(id) {this.attributes.id.value = id;},
            writable: false
        }
    });
    return node;
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



