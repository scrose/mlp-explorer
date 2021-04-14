import pool from './db.services.js';
import {
    getComparisons,
    getComparisonsByHistoricVisitID,
    getComparisonsByLocationID,
    getComparisonsByModernVisitID,
    getComparisonsByStationID,
    getComparisonsData,
} from '../queries/comparisons.queries.js';
import * as nserve from './nodes.services.js';

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
                        historic_capture: await nserve.get(comparison.historic_captures, client),
                        modern_capture: await nserve.get(comparison.modern_captures, client),
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
/*!
 * MLP.API.Services.Comparisons
 * File: comparisons.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */
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