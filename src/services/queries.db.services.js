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
 * @param {Object} args
 * @return {Function} query
 * @public
 */

export function select(model, args = { col: 'id', type: 'integer' }) {
    return function(id) {
        let sql = `SELECT * 
                FROM ${model.table} 
                WHERE ${args.col} = $1::${args.type};`;
        return {
            sql: sql,
            data: [id],
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
 * Generate query: Retrieve node entry for given item
 *
 * @param {Object} model
 * @return {Function} query function
 * @public
 */

export function getNode(model) {
    return model.hasNode()
        ? function(item) {
            const sql = `SELECT * FROM nodes WHERE id = $1::integer`;
            return {
                sql: sql,
                data: [item.attributes.nodes_id],
            }
        }
        : function(_) {return null;}
}

/**
 * Generate query: Insert node entry for given item
 *
 * @param {Object} model
 * @return {Function} query function
 * @public
 */

export function insertNode(model) {
    return model.hasNode()
        ? function(item) {
            insert({
                table: 'nodes',
                attributes: {
                    nodes_id: item.nodes_id,
                    type: model.table,
                    owner_id: item.owner_id,
                    created_at: null,
                    updated_at: null
                }
            })
        }
        : function(_) {return null;}
}

/**
 * Generate query: Update node entry for given item
 *
 * @param {Object} model
 * @return {Function} query function
 * @public
 */

export function updateNode(model) {
    return model.hasNode()
        ? function(item) {
            update({
                table: 'nodes',
                attributes: {
                    nodes_id: item.nodes_id,
                    type: model.table,
                    owner_id: item.owner_id,
                    created_at: null,
                    updated_at: null
                }
            })
        }
        : function(_) {return null;}
}

/**
 * Generate query: Delete node entry for given item
 *
 * @param {Object} model
 * @return {Function} query function
 * @public
 */

export function removeNode(model) {
    return model.hasNode()
        ? function(item) {
            remove({
                table: 'nodes',
                attributes: {
                    nodes_id: item.nodes_id,
                    type: model.table,
                    owner_id: item.owner_id,
                    created_at: null,
                    updated_at: null
                }
            })
        }
        : function(_) {return null;}
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
    console.log(refs)
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
 * Generate query: Insert new record.
 *
 * @param {Object} item
 * @param {Object} args
 * @return {Function} query binding function
 * @public
 */

export function insert(
    item,
    args = {
        ignore: ['id'],
        timestamps: ['created_at', 'updated_at'],
    },
) {
    // return null if instance is null
    if (!item) return null;

    // filter ignored columns
    const cols = Object
        .keys(item.attributes)
        .filter((key) => {
            return !args.ignore.includes(key);
        });

    // generate prepared sql
    const vals = cols.map(function(key, index) {
        let placeholder = args.timestamps.includes(key) ? `NOW()` : `$${index}`;
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
            data: _collate(item, args),
        };
    };
}

/**
 * Generate query: Update record data in table.
 *
 * @param {Object} item
 * @param {Object} args
 * @return {Function} sql query
 * @public
 */

export function update(
    item,
    args = {
        where: 'id',
        whereType: 'integer',
        index: 1,
        ignore: ['id'],
        timestamps: ['created_at', 'updated_at'],
    },
) {

    // reserve first placeholder index for id value
    const placeholderId = `$${args.index++}`;

    // zip values with column names
    const cols = Object
        .keys(item.attributes)
        .filter((key) => {
            return !args.ignore.includes(key);
        });

    // generate the parameter placeholder assignments
    const assignments = cols.map(function(key, index) {

        // handle timestamp placeholders defined in arguments
        const placeholder = args.timestamps.includes(key)
            ? `NOW()`
            : `$${args.index++}`;

        // map returns conjoined prepared parameters ordered by position
        return [cols[index], `${placeholder}::${item.attributes[key].type}`].join('=');
    });

    let sql = `UPDATE "${item.table}" 
                SET ${assignments.join(',')} 
                WHERE ${args.where} = ${placeholderId}::${args.whereType}
                RETURNING *;`;

    // return query function
    return function(item) {
        return {
            sql: sql,
            data: _collate(item, args),
        };
    };
}

/**
 * Generate query: Delete record.
 *
 * @param {Object} model
 * @param {Object} args
 * @return {function(*): {data: [*], sql: string}} sql query
 * @public
 */

export function remove(model, args = { col: 'id', type: 'integer', index: 1 }) {
    return function(item) {
        let data = item.getData();
        return {
            sql: `DELETE FROM ${model.table} 
            WHERE ${args.col} = $${args.index++}::${args.type}
            RETURNING *;`,
            data: [data.id],
        };
    };
}


/**
 * Query: Get all node types listed.
 *
 * @return {Object} query binding
 */

export function getModelTypes() {
    return {
        sql: `SELECT *
              FROM node_types
              WHERE name != 'default';`,
        data: [],
    };
}

/**
 * Query: Get model column information as array of model attributes.
 *
 * @param {String} table
 * @return {Object} query binding
 */

export function getModel(table) {
    return {
        sql: `SELECT column_name, data_type
              FROM information_schema.columns
              WHERE table_name = $1::varchar`,
        data: [table],
    };
}

/**
 * Query: Get owner model type(s) for given dependent model type
 * from the Node Relations lookup table.
 *
 * @param {String} modelType - dependent model
 * @return {Object} query binding
 */

export function getOwners(modelType) {
    return {
        sql: `SELECT owner_type
              FROM node_relations
              WHERE dependent_type = $1::varchar`,
        data: [modelType],
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
 * Query: Get all foreign key references for table. Selection from
 * pg_catalog.pg_constraint schema information.
 * Reference: https://dba.stackexchange.com/questions/36979/retrieving-all-pk-and-fk
 *
 * @return {Object} query binding
 */

export function getReferences(table) {
    return {
        sql: `
            SELECT conrelid::regclass                                                       AS fk_table
                 , CASE
                       WHEN pg_get_constraintdef(c.oid)
                           LIKE 'FOREIGN KEY %'
                           THEN substring(pg_get_constraintdef(c.oid), 14, position(')'
                                                                                    in pg_get_constraintdef(c.oid)) -
                                                                           14)
                END                                                                         AS fk_col
                 , CASE
                       WHEN pg_get_constraintdef(c.oid)
                           LIKE 'FOREIGN KEY %'
                           THEN substring(pg_get_constraintdef(c.oid), position(' REFERENCES '
                                                                                in pg_get_constraintdef(c.oid)) + 12,
                                          position('('
                                                   in substring(pg_get_constraintdef(c.oid), 14)) -
                                          position(' REFERENCES '
                                                   in pg_get_constraintdef(c.oid)) + 1) END AS pk_table
                 , CASE
                       WHEN pg_get_constraintdef(c.oid)
                           LIKE 'FOREIGN KEY %'
                           THEN substring(pg_get_constraintdef(c.oid), position('('
                                                                                in
                                                                                substring(pg_get_constraintdef(c.oid), 14)) +
                                                                       14, position(')'
                                                                                    in substring(
                                                                                        pg_get_constraintdef(c.oid),
                                                                                        position('(' in substring(pg_get_constraintdef(c.oid), 14)) + 14)) -
                                                                           1) END           AS pk_col
            FROM pg_catalog.pg_constraint c
                     JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE c.conrelid = $1::regclass
              AND c.contype = 'f'
              AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY %'
            ORDER BY pg_get_constraintdef(c.oid), conrelid::regclass::text, contype DESC;`,
        data: [table],
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
        where: null,
        whereType: null,
        ignore: [],
        timestamps: ['created_at', 'updated_at'],
    }) {

    // reserve first position for item ID (given 'where' condition)
    let data = args.where ? [item.attributes[args.where].value] : [];

    // filter input data to match insert/update parameters
    data.push(...Object.keys(item.attributes)
        .filter((key) => {
            // filter ignored and timestamp attributes
            return !args.ignore.includes(key)
                && !args.timestamps.includes(key)
                && key !== args.where;
        })
        .map((key, _) => {
            return item.attributes[key].value;
        }));

    return data;
}





