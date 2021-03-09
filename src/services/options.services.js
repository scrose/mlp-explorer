/*!
 * MLP.API.Services.Options
 * File: options.services.js
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

/**
 * Get all camera types.
 *
 * @public
 * @return {Promise} result
 */

export const getCameraTypes = async function(client=pool) {
    let { sql, data } = queries.defaults.cameras();
    let cameraTypes = await client.query(sql, data);

    // return only model type names as list
    return cameraTypes.rows;
};

/**
 * Get all lens types.
 *
 * @public
 * @return {Promise} result
 */

export const getLensTypes = async function(client=pool) {
    let { sql, data } = queries.defaults.lens();
    let lensTypes = await client.query(sql, data);

    // return only model type names as list
    return lensTypes.rows;
};