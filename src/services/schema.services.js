/*!
 * MLP.API.Services.Schema
 * File: users.model.services.js
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
import { humanize } from '../lib/data.utils.js';

/**
 * Export schema services constructor
 *
 * @public
 * @return {Promise} result
 */

export const create = async (modelType) => {

    // check model definition
    let modelTypes = await getTypes();

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
            writable: true,
        },
        attributes: {
            value: await getModel(modelType),
            writable: false,
        },
        owners: {
            value: await getOwners(modelType),
            writable: false,
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
    return modelTypes.rows.map((modelType) => { return modelType.type });
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


