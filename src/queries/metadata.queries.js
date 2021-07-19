/*!
 * MLP.API.Services.Queries.Metadata
 * File: metadata.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as defaults from './defaults.queries.js';

/**
 * Query: Get all metadata types listed.
 *
 * @return {Object} query binding
 */

export function types() {
    return {
        sql: `SELECT *
              FROM metadata_types;`,
        data: [],
    };
}

/**
 * Query: Insert metadata entry for given item instance.
 *
 * @public
 * @param {integer} id
 * @param {Object} model
 * @return {Function} query function / null if no node
 */

export function select(id, model) {
    const fn = defaults.select(model);
    return fn({id: id});
}

/**
 * Query: Insert metadata entry for given item instance.
 *
 * @param {Object} item
 * @param {Boolean} upsert
 * @return {Function} query function / null if no node
 * @public
 */

export function insert(item, upsert) {
    const fn = defaults.insert(item, upsert);
    return fn(item);
}

/**
 * Query: Update metadata entry for given item instance.
 *
 * @param {Object} item
 * @return {Function} query function / null if no node
 * @public
 */

export function update(item) {
    const fn = defaults.update(item);
    return fn(item);
}

/**
 * Query: Delete metadata entry for given item instance.
 *
 * @param {Object} item
 * @return {Function} query function / null if no node
 * @public
 */

export function remove(item) {
    const fn = defaults.remove(item);
    return fn(item);
}

/**
 * Generate query: Delete group of metadata records from database.
 *
 * @public
 * @param {String} ownerID
 * @param {String} model
 * @param {String} groupType
 * @param {String} groupCol
 * @return {Object} query
 */

export function removeGroup(ownerID, model, groupType, groupCol) {
    let sql = `DELETE FROM ${model} 
            WHERE owner_id = $1::integer
            AND ${groupCol} = $2::varchar
            RETURNING *;`

    return {
        sql: sql,
        data: [ownerID, groupType],
    };
}

/**
 * Query: Get modern capture ID values by station ID.
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
            SELECT modern_captures.nodes_id, 
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
 * Query: Check if capture has ANY mastered capture images
 *
 * @return {Object} query binding
 */

export function hasMastered(captureID, captureImageType) {
    let sql = `
            WITH 
            captureImages AS (
                SELECT image_state
                FROM ${captureImageType}
                WHERE owner_id = $1::integer
            )
            SELECT COUNT (*) AS total,
            (SELECT COUNT(*) 
                    FROM captureImages 
                    WHERE image_state = 'master' ) as mastered
            FROM captureImages
            ;`;
    return {
        sql: sql,
        data: [captureID],
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
 * Query: Get stations.
 * - includes project-based and survey-based stations
 *
 * @return {Object} query binding
 */

export function getMapLocations(filter=null) {
    let sql = `
            SELECT 
                   stations.nodes_id, 
                   stations.lat, 
                   stations.lng,
                   s.nodes_id as surveyors,
                   ss.nodes_id as surveys,
                   sss.nodes_id as survey_seasons
            FROM stations
            FULL JOIN projects p on stations.owner_id = p.nodes_id
            FULL JOIN survey_seasons sss on stations.owner_id = sss.nodes_id
            FULL JOIN surveys ss on sss.owner_id = ss.nodes_id
            FULL JOIN surveyors s on ss.owner_id = s.nodes_id
            WHERE stations.lat IS NOT NULL AND stations.lng IS NOT NULL;
    `;
    return {
        sql: sql,
        data: [],
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
 * Query: Get node or file label from defined columns.
 *
 * @return {Object} query binding
 */

export function selectLabel(
    id,
    model,
    labelCols=['id'],
    prefix=null,
    delimiter=' ',
    idCol='nodes_id'
) {
    prefix = prefix ? `'${prefix}',` : '';
    return {
        sql: `
            SELECT
                CONCAT_WS('${delimiter}', ${prefix} ${labelCols.join(',')}) AS label
            FROM ${model}
            WHERE ${idCol} = $1::integer;`,
        data: [id],
    };
}

/**
 * Generate query: Find metadata options for given model type.
 *
 * @param {String} model
 * @param {String} valueCol
 * @param {Array} labelCols
 * @param delimiter
 * @return {Function} query function
 * @public
 */

export function selectMetadataOptionsByModel(
    model,
    valueCol='id',
    labelCols = ['id'],
    delimiter=''
) {

    let sql = `SELECT 
                id,
                ${valueCol} AS value, 
                CONCAT_WS('${delimiter}', ${labelCols.join(',')}) AS label
            FROM ${model}`;
    return {
        sql: sql,
        data: [],
    };
}

/**
 * Generate query: Find node options for given model type.
 *
 * @param {String} model
 * @param {Array} labelCols
 * @param {String} delimiter
 * @param {Boolean} hasOwner
 * @return {Object} Query
 * @public
 */

export function selectNodeOptionsByModel(
    model,
    labelCols = ['nodes_id'],
    delimiter='',
    hasOwner=true
) {
    let sql = `SELECT 
                nodes_id as id,
                nodes_id AS value, 
                CONCAT_WS('${delimiter}', ${labelCols.join(',')}) AS label
                ${ hasOwner ? `, owner_id` : ''}
            FROM ${model}`;
    return {
        sql: sql,
        data: [],
    };
}

/**
 * Query: Get all participant group types listed.
 *
 * @return {Object} query binding
 */

export function participantGroupTypes() {
    return {
        sql: `SELECT *
              FROM participant_group_types;`,
        data: [],
    };
}

/**
 * Query: Get participant metadata for given node.
 * Model options include 'historic_captures' and
 * 'modern_captures'.
 *
 * @param {String} ownerID
 * @param {String} groupType
 * @return {Object} query binding
 */

export function getParticipantOptions(ownerID, groupType = null) {
    let sql = `
            SELECT
                CONCAT_WS(', ', p.last_name, p.given_names) AS full_name,
                participant_groups.id as pg_id,
                participant_groups.group_type,
                p.last_name,
                p.given_names,
                p.id
            FROM participant_groups
            INNER JOIN participants p ON participant_groups.participant_id = p.id
            WHERE participant_groups.owner_id = $1::integer
            ${groupType ? `AND group_type = $2::varchar` : ''}
            GROUP BY
                    participant_groups.id,
                     participant_groups.group_type,
                     p.last_name, 
                     p.given_names, 
                     p.id;`;
    return {
        sql: sql,
        data: groupType ? [ownerID, groupType] : [ownerID],
    };
}
