/*!
 * MLP.API.Services.Metadata
 * File: metadata.services.js
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
    let { sql, data } = queries.metadata.getCameras();
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
    let { sql, data } = queries.metadata.getLens();
    let lensTypes = await client.query(sql, data);

    // return only model type names as list
    return lensTypes.rows;
};

/**
 * Get all lens types.
 *
 * @public
 * @return {Promise} result
 */

export const getParticipants = async function(client=pool) {
    let { sql, data } = queries.metadata.getLens();
    let lensTypes = await client.query(sql, data);

    // return only model type names as list
    return lensTypes.rows;
};