/*!
 * MLP.API.Services.Queries.Comparisons
 * File: comparisons.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Query: Get comparisons for given capture node. Model options
 * include 'historic_captures' and 'modern_captures'.
 *
 * @return {Object} query binding
 */

export function insertComparison(
    historicImageID,
    historicCaptureID,
    modernImageID,
    modernCaptureID
) {
    let sql = `INSERT INTO comparison_indices (
                                historic_images, 
                                modern_images, 
                                historic_captures,
                                modern_captures,
                                created_at, 
                                updated_at
                                )
            VALUES ($1::integer, $2::integer, $3::integer, $4::integer, NOW(), NOW())
            ON CONFLICT (historic_images, modern_images)
            DO UPDATE SET
                          historic_images = $1::integer,
                          modern_images = $2::integer,
                          updated_at = NOW()
            RETURNING *;`;
    return {
        sql: sql,
        data: [historicImageID, modernImageID, historicCaptureID, modernCaptureID],
    };
}

/**
 * Query: Get comparisons for given capture node. Model options
 * include 'historic_captures' and 'modern_captures'.
 *
 * @return {Object} query binding
 */

export function getComparisons(node) {
    const { type = '', id = '' } = node || {};
    let sql = `SELECT * 
            FROM comparison_indices 
            WHERE ${type} = $1::integer`;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Query: Get comparisons for given capture image file. File options
 * include 'historic_images' and 'modern_images'.
 * - Returns unique image pair
 *
 * @return {Object} query binding
 */

export function getComparison(file) {
    const { file_type = '', id = '' } = file || {};
    let sql = `SELECT * 
            FROM comparison_indices 
            WHERE ${file_type} = $1::integer`;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Query: Get comparisons metadata for given capture node.
 * Model options include 'historic_captures' and
 * 'modern_captures'.
 *
 * @return {Object} query binding
 */

export function getComparisonsData(node) {
    const { type = '', id = '' } = node || {};
    let sql = `SELECT * 
            FROM comparison_indices 
            INNER JOIN historic_captures hc 
                ON comparison_indices.historic_captures = hc.nodes_id
                 INNER JOIN modern_captures mc 
                     ON comparison_indices.modern_captures = mc.nodes_id
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

export function getComparisonsByStationID(id) {
    let sql = `
        WITH hc AS (
            SELECT historic_captures.nodes_id,
                   historic_captures.owner_id
            FROM historic_captures
                     INNER JOIN (
                SELECT nodes_id as hv_id
                FROM historic_visits
                WHERE owner_id = $1::integer) as hv
                                ON hv_id = historic_captures.owner_id
            GROUP BY historic_captures.nodes_id
        )
        SELECT comparison_indices.modern_captures,
               comparison_indices.historic_captures,
               comparison_indices.modern_images,
               comparison_indices.historic_images
        FROM comparison_indices
                 RIGHT JOIN hc
                            ON hc.nodes_id = comparison_indices.historic_captures
        GROUP BY hc.nodes_id,
                 comparison_indices.modern_captures,
                 comparison_indices.historic_captures,
                 comparison_indices.modern_images,
                 comparison_indices.historic_images;
    `;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Query: Get capture comparisons metadata for station.
 *
 * @return {Object} query binding
 */

export function getComparisonsByLocationID(id) {
    let sql = `
        WITH mc as (
            SELECT *
            FROM modern_captures
            WHERE modern_captures.owner_id = $1::integer)
        SELECT comparison_indices.modern_captures, 
               comparison_indices.historic_captures, 
               comparison_indices.modern_images, 
               comparison_indices.historic_images
        FROM comparison_indices
                 INNER JOIN mc
                            ON mc.nodes_id = comparison_indices.modern_captures
        GROUP BY mc.nodes_id,
                 comparison_indices.modern_captures,
                 comparison_indices.historic_captures,
                 comparison_indices.modern_images,
                 comparison_indices.historic_images,
                 comparison_indices.id;
    `;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Query: Get capture comparisons metadata for historic visit.
 *
 * @return {Object} query binding
 */

export function getComparisonsByHistoricVisitID(id) {
    let sql = `
        WITH hc as (
            SELECT *
            FROM historic_captures
            WHERE historic_captures.owner_id = $1::integer)
        SELECT comparison_indices.modern_captures,
               comparison_indices.historic_captures,
               comparison_indices.modern_images,
               comparison_indices.historic_images
        FROM comparison_indices
                 INNER JOIN hc
                            ON hc.nodes_id = comparison_indices.historic_captures
        GROUP BY hc.nodes_id,
                 comparison_indices.modern_captures,
                 comparison_indices.historic_captures,
                 comparison_indices.modern_images,
                 comparison_indices.historic_images,
                 comparison_indices.id;
    `;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Query: Get capture comparisons metadata for modern visit.
 *
 * @return {Object} query binding
 */

export function getComparisonsByModernVisitID(id) {
    let sql = `
        WITH mc as (
            SELECT modern_captures.nodes_id
            FROM modern_captures
                     INNER JOIN (
                SELECT locations.nodes_id
                FROM locations
                WHERE locations.owner_id = $1::integer) as locs
                                ON locs.nodes_id = modern_captures.owner_id
        )
        SELECT comparison_indices.modern_captures, 
               comparison_indices.historic_captures, 
               comparison_indices.modern_images, 
               comparison_indices.historic_images
        FROM comparison_indices
                 INNER JOIN mc
                            ON mc.nodes_id = comparison_indices.modern_captures
        GROUP BY mc.nodes_id,
                 comparison_indices.modern_captures,
                 comparison_indices.historic_captures,
                 comparison_indices.modern_images,
                 comparison_indices.historic_images,
                 comparison_indices.id;
    `;
    return {
        sql: sql,
        data: [id],
    };
}
