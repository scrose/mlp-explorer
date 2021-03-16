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
 * Query: Get status of all capture comparisons for station.
 *
 * @return {Object} query binding
 */

export function getStationStatus(node) {
    const {id=null} = node || {};
    let sql = `SELECT *
               FROM comparison_indices 
                   INNER JOIN (SELECT historic_captures.nodes_id as hcid, * 
                   FROM historic_captures
                       INNER JOIN (SELECT * 
                            FROM historic_visits 
                            WHERE owner_id = $1::integer) as hv 
                           ON hv.nodes_id = historic_captures.owner_id
                       ) as hc
               ON historic_captures.nodes_id = comparison_indices.historic_captures;`;
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







