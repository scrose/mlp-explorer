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

export const getComparisonsByCapture = async (node, client=pool) => {

    let { sql, data } = queries.metadata.getComparisons(node);
    return client.query(sql, data)
            .then(res => {
                return res.hasOwnProperty('rows')
                && res.rows.length > 0 ? res.rows : null;
            });

};

/**
 * Get repeats (modern captures) for given station node.
 *
 * @public
 * @param {Object} node
 * @param client
 * @return {Promise} result
 */

export const getModernCapturesByStation = async (node, client=pool) => {

    const {id=''} = node || {};
    let { sql, data } = queries.metadata.getModernCapturesByStationID(id);
    return client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows : null;
        });

};

/**
 * Get historic captures for given station node.
 *
 * @public
 * @param {Object} node
 * @param client
 * @return {Promise} result
 */

export const getHistoricCapturesByStation = async (node, client=pool) => {

    const {id=''} = node || {};
    let { sql, data } = queries.metadata.getHistoricCapturesByStationID(id);
    return client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows : null;
        });
};

/**
 * Get comparisons (aligned capture pairs) for given station node.
 *
 * @public
 * @param {Object} node
 * @param client
 * @return {Promise} result
 */

export const getComparisonsByStation = async (node, client=pool) => {

    const {id=''} = node || {};
    let { sql, data } = queries.metadata.getComparisonsByStationID(id);
    return client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows : null;
        });
};

/**
 * Get status information for node.
 *
 * Stations:
 * - Station is in the 'Grouped' state. It contains historic captures that have been
 *   grouped together as a single historic station, but the location of this station
 *   has not been estimated.
 * - Station is in the 'Located' state. It contains grouped historic captures and the
 *   location of the station has been estimated. Historic captures have not been repeated.
 * - Station is in the 'Repeated' state. The station contains repeat captures, but at
 *   least one of these captures need to be mastered with its historic capture counterpart
 * - Station is in the 'Partially Mastered' state. The station contains repeat captures
 *   and at least one of them has been mastered, while others still require mastering.
 * - Station is in the 'Mastered' state. The station has been repeated and all of its
 *   captures have been mastered.
 *
 * @public
 * @param {Object} node
 * @param {Object} metadata
 * @param client
 * @return {Promise} result
 */

export const getStatus = async (node, metadata = {}, client = pool) => {

    const { type = '' } = node || {};

    // initialize image versions
    const statusInfo = {
        stations: async () => {
            const historicCaptures = await getComparisonsByStation(node, client) || [];
            const modernCaptures = await getModernCapturesByStation(node, client) || [];
            const comparisons = historicCaptures.filter(hc => hc.modern_captures);
            const { lat = null, long = null } = metadata || {};
            return {
                comparisons: comparisons,
                historic_captures: historicCaptures.length,
                modern_captures: modernCaptures.length,
                compared: null,
                grouped: historicCaptures.length > 0,
                located: historicCaptures.length > 0 && !!(lat && long),
                repeated: modernCaptures.length > 0,
                partial: modernCaptures.length > 0 && historicCaptures.length > modernCaptures.length,
                mastered: historicCaptures.length > 0 && historicCaptures.length <= comparisons.length,
            };
        },
        historic_captures: async () => {
            const comparisons = await getComparisonsByCapture(node, client) || [];
            return {
                comparisons: comparisons,
                compared: comparisons.length > 0,
            };
        },
        modern_captures: async () => {
            const comparisons = await getComparisonsByCapture(node, client) || [];
            return {
                comparisons: comparisons,
                compared: comparisons.length > 0,
            };
        },
    };

    // route database callback after file upload
    return statusInfo.hasOwnProperty(type) ? statusInfo[type]() : '';
};