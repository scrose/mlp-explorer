/*!
 * MLP.API.Services.Queries
 * File: queries.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Generate query: Find all records in table.
 *
 * @param {Object} model
 * @return {Function} query
 * @public
 */

export function getAll(model) {
    return function() {
        return {
            sql: `SELECT * FROM ${model.table};`,
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
 * @param {Object} args
 * @return {Function} query
 * @public
 */

export function find(model, args = { col: 'owner_id', owner: null }) {
    return function(id) {
        let sql = `SELECT * 
                FROM ${model.table} 
                LEFT OUTER JOIN ${args.owner} 
                ON ${model.table}.${args.col} = ${args.owner}.id`;
        console.log(sql, id);
        return {
            sql: sql,
            data: [id],
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
        where: null,
        whereType: null,
        index: 1,
        ignore: ['id'],
        timestamps: ['created_at', 'updated_at'],
    },
) {

    // nullify where arguments
    args.where = null;
    args.whereType = null;

    // get columns and prepared value placeholders
    const cols = Object
        .keys(item.fields)
        .filter((key) => {
            return !args.ignore.includes(key);
        });
    const vals = cols.map(function(key, _) {
        let placeholder = args.timestamps.includes(key) ? `NOW()` : `$${args.index++}`;
        return `${placeholder}::${item.fields[key].type}`;
    });

    let sql = `INSERT INTO ${item.table} (${cols.join(',')})
                        VALUES (${vals.join(',')})
                        RETURNING *;`;

    // return query function
    return function(item) {
        // collate data as value array
        return {
            sql: sql,
            data: collate(item, args),
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
        .keys(item.fields)
        .filter((key) => {
            return !args.ignore.includes(key);
        });
    const assignments = cols.map(function(key, index) {
        const placeholder = args.timestamps.includes(key) ? `NOW()` : `$${args.index++}`;
        return [cols[index], `${placeholder}::${item.fields[key].type}`].join('=');
    });

    let sql = `UPDATE "${item.table}" 
                SET ${assignments.join(',')} 
                WHERE ${args.where} = ${placeholderId}::${args.whereType}
                RETURNING *;`;

    // return query function
    return function(item) {
        return {
            sql: sql,
            data: collate(item, args),
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
 * Generate query: Attach node to owner as new nodes record.
 *
 * @param {String} ownerTypeConst
 * @return {Function} query binding function
 * @public
 */

export function attach(ownerTypeConst = null) {

    // get columns and prepared value placeholders
    let sql = `INSERT INTO nodes (owner_id,
                                  owner_type,
                                  dependent_id,
                                  dependent_type)
               VALUES ($1::integer,
                       $2::varchar,
                       $3::integer,
                       $4::varchar)
               ON CONFLICT (owner_id, owner_type, dependent_id, dependent_type)
                   DO UPDATE
                   SET owner_id       = $1::integer,
                       owner_type     = $2::varchar,
                       dependent_id   = $3::integer,
                       dependent_type = $4::varchar
               RETURNING *;`;

    // return query function
    return function(item) {
        let data = item.getData();

        // check that item has defined owner ID
        if (!data.hasOwnProperty('owner_id'))
            throw Error('nodetype');

        // use predefined or item owner type
        let ownerType = ownerTypeConst || data.owner_type;

        return {
            sql: sql,
            data: [data.owner_id, ownerType, data.id, item.table],
        };
    };
}

/**
 * Generate query: Detach (delete) node from owner.
 *
 * @param {String} ownerTypeConst
 * @return {Function} query binding function
 * @public
 */

export function detach(ownerTypeConst = null) {

    // get columns and prepared value placeholders
    let sql = `DELETE
               FROM nodes
               WHERE 
                owner_id = $1::integer AND
                owner_type = $2::varchar AND
                dependent_id = $3::integer AND
                dependent_type = $4::varchar
               RETURNING *;`;

    // return query function
    return function(item) {
        let data = item.getData();

        // check that item has defined owner ID
        if (!data.hasOwnProperty('owner_id'))
            throw Error('nodetype');

        // use predefined or item owner type
        let ownerType = ownerTypeConst || data.owner_type;

        return {
            sql: sql,
            data: [data.owner_id, ownerType, data.id, item.table],
        };
    };
}

/**
 * Collate item data as array of values for prepared sql.
 *
 * @param {Object} item
 * @param {Object} args
 * @return {Array} collated model data
 */

function collate(
    item,
    args = {
        where: null,
        whereType: null,
        ignore: [],
        timestamps: ['created_at', 'updated_at'],
    }) {

    // reserve first position for item ID (given where condition)
    let data = args.where ? [item.fields[args.where].value] : [];

    console.log(data, item);

    // filter input data to match insert/update parameters
    data.push(...Object.keys(item.fields)
        .filter((key) => {
            // filter ignored and timestamp fields
            return !args.ignore.includes(key)
                && !args.timestamps.includes(key)
                && key !== args.where;
        })
        .map((key, _) => {
            return item.fields[key].value;
        }));

    return data;
}






