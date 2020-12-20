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
    const refs = await getModelAttributes(modelType);

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
            value: refs.attributes,
            writable: false
        },
        node: {
            value: refs.node,
            writable: false
        },
        owner: {
            value: refs.owner,
            writable: false
        },
        attached: {
            value: refs.attached,
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

    let node = await createNode('nodes_id');
    const owner_id = 'owner_id';

    // get model attributes (table columns)
    let {sql, data} = queries.schema.getColumns(modelType);
    const attrs = await pool.query(sql, data);

    // no attributes found
    if (attrs.rows.length === 0) return refs;

    // filter nodes reference
    attrs.rows
        .filter(attr => attr.fk_table === node.table
            && attr.col === node.reference)
        .map(_ => refs.node = node);

    // filter owner reference
    attrs.rows
        .filter(attr => attr.fk_table === node.table
            && attr.col === owner_id)
        .map(attr => {
            refs.owner = {
                id: null,
                name: attr.col,
                type: attr.type,
                reference: attr.fk_table,
            };
        });

    // filter attached references
    refs.attached = attrs.rows
        .filter(attr => attr.fk_table && attr.fk_table !== node.table)
        .reduce(function(rv, x) {
            (rv[x.col] = {
                id: null,
                name: x.col,
                type: x.type,
                reference: x.fk_table,
            } || []);
            return rv;
        }, {});

    // filter non-referenced attributes
    refs.attributes = attrs.rows
        .filter(attr => attr.fk_table !== node.table)
        .reduce(function(rv, x) {
            (rv[x.col] = {
                value: null,
                name: x.col,
                label: humanize(x.col),
                type: x.type,
                reference: x.fk_table,
            } || []);
            return rv;
        }, {});
    return refs;
};

/**
 * Generates simple node object to attach to model schema.
 *
 * @public
 * @params {String} ref
 * @return {Promise} result
 */

export const createNode = async function(ref) {

    let node = {
        table:'nodes',
        reference: ref,
        attributes: {}
    };

    // get node schema info
    let {sql, data} = queries.schema.getColumns('nodes');
    let nodeSchema = await pool.query(sql, data);

    // generate node schema from table column data
    nodeSchema.rows
        .map(attr => {
            node.attributes[attr.col] = {
                name: attr.col,
                type: attr.type,
                value: null
            };
        });

    // define method to get ID key
    Object.defineProperties(node, {
        getIdKey: {
            value: function() {return 'id'},
            writable: false
        },
        getId: {
            value: function() {return this.attributes.id.value},
            writable: false
        },
        setId: {
            value: function(id) {this.attributes.id.value = id},
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



