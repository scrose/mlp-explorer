/*!
 * MLP.API.Services.Queries.Metadata
 * File: metadata.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Query: Get comparisons for given capture node.
 * Model options include 'historic_captures' and
 * 'modern_captures'.
 *
 * @return {Object} query binding
 */

export function getComparisons(node) {
    const {type='', id=''} = node || {};
    let sql = `SELECT * 
            FROM comparison_indices 
            WHERE ${type} = $1::integer`;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Query: Get capture comparisons for station.
 *
 * @return {Object} query binding
 */

export function getModernCapturesByStationID(id) {
    let sql = `
            WITH 
            locs AS (
                SELECT 
                       locations.nodes_id,
                       locations.owner_id
                FROM locations 
                INNER JOIN (
                    SELECT nodes_id
                    FROM modern_visits
                    WHERE owner_id = $1::integer
                ) as mv
                ON mv.nodes_id = locations.owner_id
            )
            SELECT
                   modern_captures.nodes_id as mc_id,
                   modern_captures.owner_id
                FROM modern_captures
                    INNER JOIN locs
                        ON modern_captures.owner_id = locs.nodes_id;`;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Query: Get historic captures for given station.
 *
 * @return {Object} query binding
 */

export function getHistoricCapturesByStationID(id) {
    let sql = `
            SELECT *
            FROM historic_captures
                INNER JOIN (
                    SELECT nodes_id as hv_id FROM historic_visits WHERE owner_id = $1::integer) as hv
                        ON hv_id = historic_captures.owner_id
                        GROUP BY hv_id, historic_captures.nodes_id;
    `;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Query: Get capture comparisons for station.
 *
 * @return {Object} query binding
 */

export function getComparisonsByStationID(id) {
    let sql = `
            WITH hc AS (
                SELECT 
                       historic_captures.nodes_id,
                       historic_captures.owner_id
                FROM historic_captures
                    INNER JOIN (
                    SELECT nodes_id as hv_id FROM historic_visits WHERE owner_id = $1::integer) as hv
                        ON hv_id = historic_captures.owner_id
                        GROUP BY historic_captures.nodes_id
                )
                SELECT
                    hc.nodes_id, 
                    comparison_indices.modern_captures 
                    FROM comparison_indices
                RIGHT JOIN hc
                    ON hc.nodes_id = comparison_indices.historic_captures
            GROUP BY
                     hc.nodes_id,
                     comparison_indices.historic_captures, 
                     comparison_indices.modern_captures;
    `;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Query: Get all lens types.
 *
 * @return {Object} query binding
 */

export function getLens() {
    return {
        sql: `SELECT *
              FROM lens;`,
        data: [],
    };
}

/**
 * Query: Get all participants.
 *
 * @return {Object} query binding
 */

export function getParticipants() {
    return {
        sql: `SELECT *
              FROM participants 
              ORDER BY participants.last_name;`,
        data: [],
    };
}

/**
 * Query: Get all participant group types.
 *
 * @return {Object} query binding
 */

export function getParticipantGroupTypes() {
    return {
        sql: `SELECT *
              FROM participant_group_types;`,
        data: [],
    };
}







