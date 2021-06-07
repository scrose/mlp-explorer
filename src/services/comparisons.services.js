/*!
 * MLP.API.Services.Comparisons
 * File: comparisons.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import pool from './db.services.js';
import {
    getComparisons,
    getComparisonsByHistoricVisitID,
    getComparisonsByLocationID,
    getComparisonsByModernVisitID,
    getComparisonsByStationID,
    getComparisonsData, insertComparison,
} from '../queries/comparisons.queries.js';
import * as nserve from './nodes.services.js';
import * as fserve from './files.services.js';


/**
 * Upsert comparison.
 *
 * @public
 * @param historicImageID
 * @param historicCaptureID
 * @param modernImageId
 * @param modernCaptureID
 * @param client
 * @return {Promise} result
 */

export const addComparison = async (
    historicImageID,
    historicCaptureID,
    modernImageId,
    modernCaptureID,
    client = pool
) => {

    console.log(historicImageID,
        historicCaptureID,
        modernImageId,
        modernCaptureID)


    if (!historicImageID ||
        !historicCaptureID ||
        !modernImageId ||
        !modernCaptureID) return [];

    let { sql, data } = insertComparison(
        historicImageID,
        historicCaptureID,
        modernImageId,
        modernCaptureID);
    return await client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows : [];
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

export const getComparisonsMetadata = async (node, client = pool) => {

    if (!node) return [];

    const { type = '', id = '' } = node || {};
    const queriesByType = {
        stations: getComparisonsByStationID(id),
        historic_visits: getComparisonsByHistoricVisitID(id),
        modern_visits: getComparisonsByModernVisitID(id),
        locations: getComparisonsByLocationID(id),
        historic_captures: getComparisonsData(node),
        modern_captures: getComparisonsData(node),
    };

    if (queriesByType.hasOwnProperty(type)) {
        let { sql, data } = queriesByType[type];

        // get comparison indices
        const comparisons = await client.query(sql, data)
            .then(res => {
                return res.hasOwnProperty('rows')
                && res.rows.length > 0 ? res.rows : [];
            });

        // get associated capture metadata
        // append full data for each returned capture
        return await Promise.all(
            (comparisons || [])
                // .filter(comparison => comparison)
                .map(async (comparison) => {
                    return {
                        id: comparison.id,
                        historic_image_id: comparison.historic_images,
                        historic_image: await fserve.get(comparison.historic_images, client),
                        modern_image_id: comparison.modern_images,
                        modern_image: await fserve.get(comparison.modern_images, client),
                    };
                }));
    }
    return [];
};

/**
 * Get comparisons for given capture node.
 *
 * @public
 * @param {Object} node
 * @param client
 * @return {Promise} result
 */

export const getComparisonsByCapture = async (node, client = pool) => {

    let { sql, data } = getComparisons(node);
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

export const getComparisonsByStation = async (node, client = pool) => {

    const { id = '' } = node || {};
    let { sql, data } = getComparisonsByStationID(id);
    return client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows : [];
        });
};

/**
 * Check whether capture images are compatible for comparison.
 * - find a common station
 *
 * @public
 * @param historicCapture
 * @param modernCapture
 * @param client
 * @return {Promise} result
 */

export const isCompatiblePair = async (historicCapture, modernCapture, client = pool) => {

    // check if valid file IDs
    if (!historicCapture || !modernCapture) return null;

    // check if correct owner type
    if (
        historicCapture.owner_type !== 'historic_visits'
        || modernCapture.owner_type !== 'locations'
    ) return null;

    // get path of owner node in hierarchy
    const historicPath = await nserve.getPath(historicCapture);
    const modernPath = await nserve.getPath(modernCapture);

    // check that node path exists
    if (!modernPath || !historicPath) return false;

    // get station node
    const historicStationKey = Object.keys(historicPath)
        .find(key => {
            const { node = {} } = historicPath[key] || {};
            const { type = '' } = node || {};
            return type === 'stations';
        });

    // get station node
    const modernStationKey = Object.keys(modernPath)
        .find(key => {
            const { node = {} } = modernPath[key] || {};
            const { type = '' } = node || {};
            return type === 'stations';
        });

    if (!historicStationKey || !modernStationKey) return null;

    const historicStation = historicPath[historicStationKey];
    const modernStation = modernPath[modernStationKey];
    return historicStation.nodes_id === modernStation.nodes_id;
};