/*!
 * MLP.API.Services.Queries.Files
 * File: files.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as defaults from './defaults.queries.js';

/**
 * Query: Get all file types listed.
 *
 * @return {Object} query binding
 */

export function types() {
    return {
        sql: `SELECT *
              FROM file_types;`,
        data: [],
    };
}

/**
 * Query: Get all files by file type.
 *
 * @param {String} fileType
 * @param {int} limit
 * @return {Object} query statement
 */

export function getFilesByType(fileType, limit=10) {
    return {
        sql: `SELECT *
              FROM files 
              INNER JOIN ${fileType} ON files.id = ${fileType}.files_id
              WHERE files.file_type = $1::varchar
              LIMIT ${limit};
              `,
        data: [fileType],
    };
}

/**
 * Generate query: Retrieve files by id array.
 *
 * @return {Function} query function
 * @public
 */

export function filterByIDArray(ids, offset, limit) {
    const sql = `SELECT 
            *, 
            (SELECT COUNT(*) FROM files WHERE id = ANY($1)) as total
            FROM files 
            WHERE id = ANY($1)
            OFFSET ${offset}
            LIMIT ${limit}`;
    return {
        sql: sql,
        data: [ids],
    };
}

/**
 * Query: Get all historic image files attached to a station ID.
 *
 * @return {Object} query binding
 */

export function getHistoricImageFilesByStationID(id) {
    let sql = `
            WITH 
            hcaps AS (
            SELECT historic_captures.nodes_id, 
                   historic_captures.owner_id
                FROM historic_captures
                    INNER JOIN (
                    SELECT nodes_id
                    FROM historic_visits
                    WHERE owner_id = $1::integer
                ) as hv
                ON hv.nodes_id = historic_captures.owner_id
            )
            SELECT * FROM files 
                INNER JOIN hcaps ON hcaps.nodes_id = files.owner_id 
                INNER JOIN historic_images ON historic_images.files_id = files.id
          ;`;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Query: Get all modern image files attached to a station ID.
 *
 * @return {Object} query binding
 */

export function getModernImageFilesByStationID(id) {
    let sql = `
            WITH 
            locs AS (
                SELECT 
                       locations.nodes_id as loc_node_id,
                       locations.owner_id
                FROM locations 
                INNER JOIN (
                    SELECT nodes_id AS mv_node_id
                    FROM modern_visits
                    WHERE owner_id = $1::integer
                ) as mv
                ON mv.mv_node_id = locations.owner_id
            ),
            mcaps AS (
            SELECT * FROM modern_captures
                    INNER JOIN locs
                        ON modern_captures.owner_id = locs.loc_node_id
            )
            SELECT * FROM files 
                INNER JOIN mcaps ON mcaps.nodes_id = files.owner_id
                INNER JOIN modern_images ON modern_images.files_id = files.id
          ;`;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Query: Get all unsorted capture image files attached to a station ID.
 *
 * @return {Object} query binding
 */

export function getUnsortedImageFilesByStationID(id) {
    let sql = `
            WITH 
            hcaps AS (
                SELECT historic_captures.nodes_id, historic_captures.owner_id
                FROM historic_captures
                WHERE owner_id = $1::integer
            ),
            mcaps AS (
                SELECT modern_captures.nodes_id, modern_captures.owner_id
                FROM modern_captures
                WHERE owner_id = $1::integer
            ),
            mvs AS (
                SELECT modern_visits.nodes_id as mv_node_id
                FROM modern_visits
                WHERE owner_id = $1::integer
            ),
            mvcaps AS (
                SELECT modern_captures.nodes_id, modern_captures.owner_id 
                FROM modern_captures
                    INNER JOIN mvs ON modern_captures.owner_id = mv_node_id
            )
            SELECT * FROM files 
                INNER JOIN hcaps ON hcaps.nodes_id = files.owner_id 
                INNER JOIN historic_images ON historic_images.files_id = files.id
            UNION
            SELECT * FROM files 
                INNER JOIN mcaps ON mcaps.nodes_id = files.owner_id 
                INNER JOIN modern_images ON modern_images.files_id = files.id
            UNION
            SELECT * FROM files 
                INNER JOIN mvcaps ON mvcaps.nodes_id = files.owner_id 
                INNER JOIN modern_images ON modern_images.files_id = files.id
          ;`;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Generate query: Retrieve file entry for given item
 *
 * @param {Object} fileID
 * @return {Object} query
 * @public
 */

export function select(fileID) {
    return {
        sql: `SELECT *
                 FROM files
                 WHERE id = $1::integer`,
        data: [fileID],
    };
}

/**
 * Generate query: Find any file by owner id.
 *
 * @return {Object} query
 * @public
 */

export function hasFile(id) {
    const sql = `SELECT exists(
            SELECT 1 
            FROM files 
            WHERE owner_id = $1::integer 
    )`;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Generate query: Retrieve file entries attached to given owner
 *
 * @return {Object} query
 * @public
 */

export function selectByOwner(owner_id) {
    return {
        sql: `SELECT *
                 FROM files
                 WHERE owner_id = $1::integer`,
        data: [owner_id],
    };
}

/**
 * Generate query: Insert file entry for given item
 *
 * @return {Object} query
 * @public
 * @param file
 */

export function insert(file) {
    const fn = defaults.insert(file);
    return fn(file);
}

/**
 * Generate query: Update file entry for given item
 *
 * @return {Object} query
 * @public
 * @param file
 */

export function update(file) {
    const fn = defaults.update(file);
    return fn(file);
}

/**
 * Generate query: Delete file entry for given item
 * - cascade deletes the metadata record for filetype
 *
 * @return {Object} query
 * @public
 * @param id
 */

export function remove(id) {
    return {
        sql: `DELETE FROM files 
        WHERE id = $1::integer
        RETURNING *;`,
        data: [id],
    };
}