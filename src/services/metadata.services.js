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
import * as fserve from './files.services.js';

/**
 * Get all metadata records for given model and owner.
 *
 * @public
 * @param {String} model
 * @param client
 * @return {Promise} result
 */

export const getAll = async function(model, client=pool) {
    let { sql, data } = queries.defaults.selectByModel(model);
    let metadata = await client.query(sql, data);

    // return only model type names as list
    return metadata.rows;
};

/**
 * Get metadata options.
 *
 * @public
 * @return {Promise} result
 */

export const getOptions = async function(client=pool) {
    return {
        image_state: await fserve.getImageStates(),
        cameras_id: await getAll('cameras', client),
        lens_id: await getAll('lens', client),
        participants: await getAll('participants', client),
        participant_group_types: await getAll('participant_group_types', client)
    }
};

/**
 * Get comparisons for given capture node.
 *
 * @public
 * @param {Object} node
 * @param client
 * @return {Promise} result
 */

export const getComparisons = async (node, client=pool) => {

    let { sql, data } = queries.metadata.getComparisons(node);
    return client.query(sql, data)
            .then(res => {
                return res.hasOwnProperty('rows')
                && res.rows.length > 0 ? res.rows : null;
            });

};

/**
 * Get comparisons for given capture node.
 *
 * @public
 * @param {Object} node
 * @param client
 * @return {Promise} result
 */

export const getStationStatus = async (node, client=pool) => {

    const {id=''} = node || {};
    let { sql, data } = queries.metadata.getStationStatus(id);
    return client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows : null;
        });

};