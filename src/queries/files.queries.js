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
 * Query: Get node relation(s) from owner node type.
 *
 * @param {String} nodeType
 * @return {Object} query binding
 */

export function getRelationsByNodeType(nodeType) {
    return {
        sql: `SELECT dependent_type
              FROM file_relations 
              WHERE owner_type = $1::varchar;`,
        data: [nodeType],
    };
}

/**
 * Query: Get node relation(s) from file type.
 *
 * @param {String} fileType
 * @return {Object} query binding
 */

export function getOwnerTypeByFileType(fileType) {
    return {
        sql: `SELECT owner_type
              FROM file_relations 
              WHERE dependent_type = $1::varchar;`,
        data: [fileType],
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
 * Generate query: Insert file entry for given item
 *
 * @return {Function} query function / null if no node
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
 * @return {Function} query function / null if no node
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
 * @return {Function} query function / null if no node
 * @public
 */

export function remove(file) {
    const fn = defaults.remove(file);
    return fn(file);
}