/*!
 * MLP.API.Services.Queries
 * File: queries.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
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
                    FROM ${model.table} 
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
                FROM ${model.table} 
                WHERE ${model.idKey} = $1::integer;`;
        return {
            sql: sql,
            data: [item.id],
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
    const ignore = model.node ? [] : [model.idKey];
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
    let sql = `INSERT INTO ${model.table} (${cols.join(',')})
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
    const ignore = model.node ? [] : [model.idKey];
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

    let sql = `UPDATE "${model.table}" 
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
 * null if this is a node removal.
 *
 * @param {Object} model
 * @return {function(*): {data: [*], sql: string}} sql query
 * @public
 */

export function remove(model) {
    return !model.node
        ? function(item) {
            return {
                sql: `DELETE FROM ${model.table} 
            WHERE ${model.idKey} = $1::integer
            RETURNING *;`,
                data: [item.id],
            };
        }
        : null;
}

/**
 * Generate query: Find record by Node entry.
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
        data: [node.id],
    };
}

/**
 * Generate query: Retrieve node entry for given item
 *
 * @param {Object} model
 * @return {Function} query function / null if no node
 * @public
 */

export function selectNode(model) {
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
            let query = insert(node);
            return query(node);
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
            let query = update(node);
            return query(node);
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
            let query = remove(node);
            return query(node);
        }
        : null;
}

/**
 * Generate query: Retrieve file entry for given item
 *
 * @param {Object} model
 * @return {Function} query function / null if no node
 * @public
 */

export function selectFile(model) {
    // return model.file
    //     ? function(fileItem) {
    //         const sql = `SELECT *
    //                      FROM files
    //                      WHERE id = $1::integer`;
    //         return {
    //             sql: sql,
    //             data: [fileItem.attributes.id],
    //         };
    //     }
    //     : null;
}

/**
 * Generate query: Insert file entry for given item
 *
 * @param {Object} model
 * @return {Function} query function / null if no node
 * @public
 */

export function insertFile(model) {
    return model.file
        ? function(file) {
            let query = insert(file);
            return query(file);
        }
        : null;
}

/**
 * Generate query: Update file entry for given item
 *
 * @param {Object} model
 * @return {Function} query function / null if no node
 * @public
 */

export function updateFile(model) {
    return model.file
        ? function(file) {
            let query = update(file);
            return query(file);
        }
        : null;
}

/**
 * Generate query: Delete file entry for given item
 *
 * @param {Object} model
 * @return {Function} query function / null if no node
 * @public
 */

export function removeFile(model) {
    return model.file
        ? function(file) {
            let query = remove(file);
            return query(file);
        }
        : null;
}

/**
 * Generate query: Append child nodes by specified table,
 * column and column value.
 *
 * @return {Function} query function
 * @public
 */

export function getChildNodes(id) {
    const sql = `SELECT * 
            FROM nodes 
            WHERE owner_id = $1::integer`;
    return {
        sql: sql,
        data: [id],
    };
}

/**
 * Generate query: Append child nodes by specified table,
 * column and column value.
 *
 * @return {Function} query function
 * @public
 */

export function getAttached(model) {

    console.log(model.attached)

    // get child references for model
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
 * Generate query: Find all records in nodes table for
 * requested model.
 *
 * @param {Object} model
 * @return {Function} query
 * @public
 */

export function getNodes(model) {
    return {
        sql: `SELECT * 
                FROM nodes
                WHERE nodes.type=$1::varchar`,
        data: [model],
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
              FROM node_types;`,
        data: [],
    };
}

/**
 * Generate query: Retrieve node entry for given ID.
 *
 * @param {integer} id
 * @return {Function} query function / null if no node
 * @public
 */

export function getNode(id) {
    return {
        sql: `SELECT * FROM nodes WHERE id = $1::integer`,
        data: [id]
    }
}

/**
 * Query: Get all file types listed.
 *
 * @return {Object} query binding
 */

export function getFileTypes() {
    return {
        sql: `SELECT *
              FROM file_types;`,
        data: [],
    };
}

/**
 * Generate query: Retrieve file entry for given ID.
 *
 * @param {integer} id
 * @return {Function} query function / null if no node
 * @public
 */

export function getFile(id) {
    return {
        sql: `SELECT * FROM files WHERE id = $1::integer`,
        data: [id]
    }
}

/**
 * Generate query: Retrieve file entries attached to given owner
 *
 * @return {Function} query function / null if no node
 * @public
 */

export function getAttachedFiles(owner_id) {
    return {
        sql: `SELECT *
                 FROM files
                 WHERE owner_id = $1::integer`,
        data: [owner_id],
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
        sql: `WITH fk_cols AS (
            SELECT
                col.attname as col,
                rel_fk.relname as ref_table
--                 fk_col.attname as ref_id
            FROM pg_catalog.pg_constraint con
                     INNER JOIN pg_catalog.pg_class rel
                                ON rel.oid = con.conrelid
                     INNER JOIN pg_catalog.pg_class rel_fk
                                ON rel_fk.oid = con.confrelid
                     INNER JOIN pg_catalog.pg_namespace nsp
                                ON nsp.oid = connamespace
                     INNER JOIN pg_catalog.pg_attribute col
                                ON (col.attrelid = rel.oid AND ARRAY[col.attnum] <@ con.conkey)
--                      INNER JOIN pg_catalog.pg_attribute fk_col
--                                 ON (fk_col.attrelid = rel_fk.oid AND ARRAY[fk_col.attnum] <@ con.confkey)
            WHERE nsp.nspname = 'public'
              AND rel.relname = $1::varchar)

              select column_name as col, data_type, fk_cols.ref_table
              from information_schema.columns
                       LEFT JOIN fk_cols ON column_name = fk_cols.col
              where table_name = $1::varchar
              order by fk_cols.col;`,
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






