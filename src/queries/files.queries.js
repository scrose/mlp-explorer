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
 *
 * @param {Object} file
 * @return {Object} query
 * @public
 */

export function remove(file) {
    const fn = defaults.remove(file);
    return fn(file);
}