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
 * Generate query: Retrieve file entry for given item
 *
 * @param {Object} fileID
 * @return {Function} query function / null if no node
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
 * Generate query: Retrieve file entries attached to given owner
 *
 * @return {Function} query function / null if no node
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
 * Generate query: Insert file record.
 *
 * @param {Object} file
 * @return {Function} query function / null if no node
 * @public
 */

export function insert(file) {
    return defaults.insert(file);
}

/**
 * Generate query: Update file record data.
 *
 * @param {Object} file
 * @return {Function} query function / null if no node
 * @public
 */

export function update(file) {
    return defaults.update(file);
}

/**
 * Generate query: Delete file record.
 *
 * @param {Object} file
 * @return {Function} query function / null if no node
 * @public
 */

export function remove(file) {
    return defaults.remove(file);
}