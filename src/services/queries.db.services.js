/*!
 * MLP.API.Services.Queries
 * File: queries.db.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import { groupBy } from '../lib/data.utils.js';

/**
 * Database rows limit.
 */

const limit = 100;

/**
 * Generate query: Find all records in table.
 *
 * @param {Object} model
 * @param {int} offset
 * @return {Function} query
 * @public
 */

export function getAll(model, offset = 0) {
    return function() {
        return {
            sql: `SELECT * 
                    FROM ${model.table} 
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
                FROM ${model.table} 
                WHERE ${model.getIdKey()} = $1::integer;`;
        return {
            sql: sql,
            data: [item.getId()],
        };
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
                FROM ${model.table} 
                LEFT OUTER JOIN ${owner_type} 
                ON ${model.table}.owner_id = ${owner_id} 
                       AND ${model.table}.owner_type = ${owner_type}`;
        return {
            sql: sql,
            data: [owner_id, owner_type],
        };
    };
}

/**
 * Generate query: Insert new record into database.
 *
 * @param {Object} item
 * @return {Function} query binding function
 * @public
 */

export function insert(item) {

    // return null if instance is null
    if (!item) return null;

    const timestamps = ['created_at', 'updated_at'];

    // filter ignored columns
    const ignore = [item.getIdKey()];
    const cols = Object
        .keys(item.attributes)
        .filter((key) => {
            return !ignore.includes(key);
        });

    // generate prepared sql
    const vals = cols.map(function(key, index) {
        let placeholder = timestamps.includes(key) ? `NOW()` : `$${++index}`;
        return `${placeholder}::${item.attributes[key].type}`;
    });

    // construct prepared statement
    let sql = `INSERT INTO ${item.table} (${cols.join(',')})
                        VALUES (${vals.join(',')})
                        RETURNING *;`;

    // return query function
    return function(item) {
        // collate data as value array
        return {
            sql: sql,
            data: _collate(item),
        };
    };
}

/**
 * Generate query: Update record in table.
 *
 * @param {Object} item
 * @return {Function} sql query
 * @public
 */

export function update(item) {

    const timestamps = ['created_at', 'updated_at'];

    // filter ignored values
    const ignore = [item.getIdKey()];
    const cols = Object
        .keys(item.attributes)
        .filter((key) => {
            return !ignore.includes(key);
        });

    // generate prepared statement value placeholders
    const assignments = cols.map(function(key, index) {
        // handle timestamp placeholders defined in arguments
        const placeholder = timestamps.includes(key)
            ? `NOW()`
            : `$${++index + 1}`;

        // map returns conjoined prepared parameters in order
        return [cols[index], `${placeholder}::${item.attributes[key].type}`].join('=');
    });

    let sql = `UPDATE "${item.table}" 
                SET ${assignments.join(',')} 
                WHERE ${item.getIdKey()} = $1::integer
                RETURNING *;`;

    // return query function
    return function(item) {
        return {
            sql: sql,
            data: _collate(item),
        };
    };
}

/**
 * Generate query: Delete record from database.
 *
 * @param {Object} model
 * @return {function(*): {data: [*], sql: string}} sql query
 * @public
 */

export function remove(model) {
    return function(item) {
        return {
            sql: `DELETE FROM ${model.table} 
            WHERE ${model.getIdKey()} = $1::integer
            RETURNING *;`,
            data: [item.getId()],
        };
    };
}

/**
 * Generate query: Retrieve node entry for given item
 *
 * @param {Object} model
 * @return {Function} query function / null if no node
 * @public
 */

export function getNode(model) {
    return model.node
        ? function(node) {
            const sql = `SELECT *
                         FROM nodes
                         WHERE id = $1::integer`;
            return {
                sql: sql,
                data: [node.attributes.id],
            };
        }
        : null;
}

/**
 * Generate query: Insert node entry for given item
 *
 * @param {Object} model
 * @return {Function} query function / null if no node
 * @public
 */

export function insertNode(model) {
    return model.node
        ? function(node) {
            return insert(node);
        }
        : null;
}

/**
 * Generate query: Update node entry for given item
 *
 * @param {Object} model
 * @return {Function} query function / null if no node
 * @public
 */

export function updateNode(model) {
    return model.node
        ? function(node) {
            return update(node);
        }
        : null;
}

/**
 * Generate query: Delete node entry for given item
 *
 * @param {Object} model
 * @return {Function} query function / null if no node
 * @public
 */

export function removeNode(model) {
    return model.node
        ? function(node) {
            return remove(node);
        }
        : null;
}

/**
 * Generate query: Append subordinate record by specified table,
 * column and column value.
 *
 * @return {Function} query function
 * @public
 */

export function append(model) {
    // get attachments for model
    const refs = groupBy(model.attached, 'fk_col');
    return function(args, value) {
        const sql = `SELECT * 
                FROM ${args.pk_table} 
                WHERE ${args.pk_col} = $1::${args.pk_col_type}`;
        return {
            sql: sql,
            data: [value],
        };
    };
}

/**
 * Query: Get all node types listed.
 *
 * @return {Object} query binding
 */

export function getNodeTypes() {
    return {
        sql: `SELECT *
              FROM node_types
              WHERE name != 'default';`,
        data: [],
    };
}

/**
 * Query: Get all of the table names in the MLP database.
 *
 * @return {Object} query binding
 */

export function getTables() {
    return {
        sql: `SELECT table_name
              FROM information_schema.tables
              WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE';`,
        data: [],
    };
}

/**
 * Query: Get columns of target table incl. foreign key references.
 * Selection from pg_catalog.pg_constraint schema information.
 * Reference: https://stackoverflow.com/a/21125640
 * col: column name
 * type: column datatype
 * fk_table: referenced table
 *
 * @public
 * @param {String} targetTable
 * @return {Object} query binding
 */

export function getColumns(targetTable) {
    return {
        sql: `select
                  column_name as "col",
                  data_type as "type",
                  (select r.relname from pg_class r where r.oid = pc.confrelid)
                      as "fk_table"
              from information_schema.columns
                       full join pg_constraint pc
                                 on column_name = (select string_agg(attname, ',') from pg_attribute
                                                   where attrelid = pc.conrelid
                                                     and ARRAY[attnum] <@ pc.conkey)
                                     and pc.conrelid = (
                                         select oid
                                         from pg_class
                                         where relname=table_name
                                     )
              where table_name = $1
                and 'public' = (select nspname
                                from pg_namespace
                                where oid =
                                      (select relnamespace
                                       from pg_class
                                       where relname = $1)
              );`,
        data: [targetTable],
    };
}

/**
 * Query: Get user permissions settings.
 *
 * @return {Object} query binding
 */

export function getPermissions() {
    return {
        sql: `
            SELECT *
            FROM user_permissions`,
        data: [],
    };
}

/**
 * Helper Method: Collate item data as array of values for prepared sql.
 *
 * @param {Object} item
 * @param {Object} args
 * @return {Array} collated model data
 */

function _collate(
    item,
    args = {
        ignore: [],
        timestamps: ['created_at', 'updated_at'],
    }) {

    // reserve first position for item ID (given 'where' condition)
    let data = [item.getId()];

    // filter input data to match insert/update parameters
    data.push(...Object.keys(item.attributes)
        .filter((key) => {
            // filter ignored, timestamp, ID attributes
            return !args.ignore.includes(key)
                && !args.timestamps.includes(key)
                && key !== item.getIdKey();
        })
        .map((key, _) => {
            return item.attributes[key].value;
        }));

    return data;
}





