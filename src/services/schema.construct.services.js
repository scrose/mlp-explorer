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
    const attributes = await getModel(modelType);
    const attached = await getAttached(modelType, attributes);
    const owners = await getOwners(modelType);

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
            value: attributes,
            writable: false
        },
        attached: {
            value: attached,
            writable: false
        },
        owners: {
            value: owners,
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
 * Get all referenced models.
 *
 * @public
 * @param {String} modelType
 * @param {Object} attributes
 * @return {Promise} result
 */

export const getAttached = async function(modelType, attributes) {

    // get the foreign key references
    const { sql, data } = queries.schema.getReferences(modelType);
    const refs = await pool.query(sql, data);

    // include data type in referenced columns
    return refs.rows.map(ref => {
        ref.pk_col_type = attributes[ref.fk_col].type;
        return ref;
    });
};

/**
 * Find and format model schema.
 *
 * @public
 * @param {String} modelType
 * @return {Promise} result
 */

export const getModel = async function(modelType) {
    let attributes = {};
    let { sql, data } = queries.schema.getModel(modelType);
    let result = await pool.query(sql, data);

    // generate schema from table column data
    result.rows
        .forEach((col) => {
            attributes[col.column_name] = {
                label: humanize(col.column_name),
                type: col.data_type,
                restrict: [],
                render: {
                    create: {
                        validation: [],
                    },
                    edit: {
                        validation: [],
                    },
                    remove: {
                        validation: [],
                    },
                },
            };
        });
    return attributes;
};

/**
 * Get model owners.
 *
 * @public
 * @param {String} model
 * @return {Promise} result
 */

export const getOwners = async function(model) {
    let { sql, data } = queries.schema.getOwners(model);
    let owners = await pool.query(sql, data);
    return owners.rows;
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

    // convert result to object
    return groupBy(permissions.rows, 'model');
};


