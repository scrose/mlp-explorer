/*!
 * MLP.API.Services.Queries.Model
 * File: defaults.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import { groupBy } from '../lib/data.utils.js';

/**
 * Database rows limit.
 */

const limit = 50;

/**
 * Generate query: Find all records in table.
 *
 * @param {Object} model
 * @param {int} offset
 * @param order
 * @return {Function} query
 * @public
 */

export function getAll(model, offset = 0, order='') {

    // (optional) order by attribute
    const orderby = order ? `ORDER BY ${order}` : '';

    return function() {
        return {
            sql: `SELECT * 
                    FROM ${model.name} 
                    ${orderby}
                    LIMIT ${limit} 
                    OFFSET ${offset};`,
            data: [],
        };
    };
}

/**
 * Generate query: Find record by ID.
 *
 * @param {Object} model
 * @return {Function} query
 * @public
 */

export function select(model) {
    return function(item) {
        let sql = `SELECT * 
                FROM ${model.name} 
                WHERE ${model.idKey} = $1::integer;`;
        return {
            sql: sql,
            data: [item.id],
        };
    };
}

/**
 * Generate query: Find record by associated node.
 *
 * @param {Object} node
 * @return {Function} query
 * @public
 */

export function selectByNode(node) {
    let sql = `SELECT * 
            FROM ${node.type} 
            WHERE nodes_id = $1::integer;`;
    return {
        sql: sql,
        data: [node.id]
    };
}

/**
 * Generate query: Find record by associated file.
 *
 * @param {Object} file
 * @return {Function} query
 * @public
 */

export function selectByFile(file) {
    let sql = `SELECT * 
            FROM ${file.file_type} 
            WHERE files_id = $1::integer;`;
    return {
        sql: sql,
        data: [file.id]
    };
}

/**
 * Select table records by owner id
 *
 * @param {String} id
 * @param table
 * @return {Function} query function
 * @public
 */

export function selectByOwner(id, table) {
    return {
        sql: `SELECT *
                 FROM ${table} 
                 WHERE owner_id = $1::integer`,
        data: [id],
    };
}

/**
 * Generate query: Find records by owner type.
 *
 * @param {Object} model
 * @return {Function} query function
 * @public
 */

export function findByOwner(model) {
    return function(owner_id, owner_type) {
        let sql = `SELECT * 
                FROM ${model.name} 
                LEFT OUTER JOIN ${owner_type} 
                ON ${model.name}.owner_id = ${owner_id} 
                       AND ${model.name}.owner_type = ${owner_type}`;
        return {
            sql: sql,
            data: [owner_id, owner_type],
        };
    };
}

/**
 * Generate query: Insert new record into database.
 *
 * @param {Object} model
 * @param {Array} timestamps
 * @return {Function} query binding function
 * @public
 */

export function insert(
    model,
    timestamps = ['created_at', 'updated_at']
) {

    // return null if instance is null
    if (!model) return null;

    // filter ignored columns
    // - do not ignore if model is for a node or file
    const ignore = model.node || model.file ? [] : [model.idKey];
    const cols = Object
        .keys(model.attributes)
        .filter((key) => {
            return !ignore.includes(key);
        });

    // generate prepared sql
    let index = 1;
    const vals = cols.map(key => {
        const placeholder = timestamps.includes(key) ? `NOW()` : `$${index++}`;
        return `${placeholder}::${model.attributes[key].type}`;
    });

    // construct prepared statement
    let sql = `INSERT INTO ${model.name} (${cols.join(',')})
                        VALUES (${vals.join(',')})
                        RETURNING *;`;

    // return query function
    return function(item) {
        // filter input data to match insert parameters
        // filters: ignored, timestamp, ID attributes
        let data = Object.keys(item.attributes)
            .filter(key =>
                !ignore.includes(key)
                && !timestamps.includes(key))
            .map(key => {
                return item.attributes[key].value;
            });

        // collate data as value array
        return {
            sql: sql,
            data: data
        };
    };
}

/**
 * Generate query: Update record in table.
 *
 * @param {Object} model
 * @param {Array} timestamps
 * @return {Function} sql query
 * @public
 */

export function update(model, timestamps = ['created_at', 'updated_at']) {

    // return null if instance is null
    if (!model) return null;

    // filter ignored columns: Do not ignore ID column if using node reference
    const ignore = model.node || model.file ? [] : [model.idKey];
    const cols = Object
        .keys(model.attributes)
        .filter((key) => {
            return !ignore.includes(key);
        });

    // generate prepared statement value placeholders
    let index = 2;
    const assignments = cols.map(attr => {
        // handle timestamp placeholders defined in arguments
        const placeholder = timestamps.includes(attr)
            ? `NOW()`
            : `$${index++}`;

        // map returns conjoined prepared parameters in order
        return [attr, `${placeholder}::${model.attributes[attr].type}`].join('=');
    });

    let sql = `UPDATE "${model.name}" 
                SET ${assignments.join(',')} 
                WHERE ${model.idKey} = $1::integer
                RETURNING *;`;

    // return query function
    return function(item) {

        // place ID value at front of array
        let data = [item.id];

        // filter input data to match update parameters
        data.push(...Object.keys(item.attributes)
            .filter(key =>
                !ignore.includes(key)
                && !timestamps.includes(key))
            .map(key => {
                return item.attributes[key].value;
            }));

        return {
            sql: sql,
            data: data,
        };
    };
}

/**
 * Generate query: Delete record from database. Returns
 * null if this is a node or file removal.
 *
 * @param {Object} model
 * @return {function(*): {data: [*], sql: string}} sql query
 * @public
 */

export function remove(model) {
    return !model.node && !model.file
        ? function(item) {
            return {
                sql: `DELETE FROM ${model.name} 
            WHERE ${model.idKey} = $1::integer
            RETURNING *;`,
                data: [item.id],
            };
        }
        : null;
}