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
    return function () {
        return {
            sql: `SELECT * FROM ${model.name};`,
            data: []
        }
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

export function select(model,args={col: 'id', type:'integer'}) {
    return function (id) {
        return {
            sql: `SELECT * 
                FROM ${model.name} 
                WHERE ${args.col} = $1::${args.type};`,
            data: [id]
        }
    };
}

/**
 * Generate query: Insert new record.
 *
 * @param {Object} model
 * @param {Object} args
 * @return {function(*): {data: Array, index: number, sql: string}} sql query
 * @public
 */

export function insert(
    model,
    args={
        where: null,
        whereType:null,
        index:1,
        ignore: ['id'],
        timestamps: ['created_at', 'updated_at']}
    ) {

    // nullify where arguments
    args.where = null;
    args.whereType = null;

    // get columns and prepared value placeholders
    const cols = Object
        .keys(model.fields)
        .filter((key) => {return !args.ignore.includes(key)});
    const vals = cols.map(function(key, _) {
        let placeholder = args.timestamps.includes(key) ? `NOW()` : `$${args.index++}`;
        return `${placeholder}::${model.fields[key].type}`;
    });

    let sql = `INSERT INTO ${model.name} (${cols.join(",")})
                VALUES (${vals.join(",")})
                RETURNING *;`

    // return query function
    return function (item) {
        // collate data as value array
        return {
            sql:sql,
            data: collate(item, args),
            index: args.index
        };
    }
}

/**
 * Generate query: Update record data in table.
 *
 * @param {Object} item
 * @param {Object} args
 * @return {function(*): {data: Array, index: number, sql: string}} sql query
 * @public
 */

export function update(
    item,
    args={
        where: 'id',
        whereType:'integer',
        index: 1,
        ignore: ['id'],
        timestamps: ['created_at', 'updated_at']
    }
) {

    // reserve first placeholder index for id value
    const placeholderId = `$${args.index++}`;

    // zip values with column names
    const cols = Object
        .keys(item.fields)
        .filter((key) => {return !args.ignore.includes(key)});
    const assignments = cols.map(function(key, index) {
        const placeholder = args.timestamps.includes(key) ? `NOW()` : `$${args.index++}`;
        return [cols[index], `${placeholder}::${item.fields[key].type}`].join("=");
    });

    let sql = `UPDATE "${item.name}" 
                SET ${assignments.join(",")} 
                WHERE ${args.where} = ${placeholderId}::${args.whereType}
                RETURNING *;`

    // return query function
    return function (item) {
        return {
            sql:sql,
            data: collate(item, args),
            index:args.index
        };
    }
}

/**
 * Generate query: Delete record.
 *
 * @param {Object} model
 * @param {Object} args
 * @return {function(*): {data: [*], sql: string}} sql query
 * @public
 */

export function remove(model, args={col: 'id', type:'integer', index:1}) {
    return function (id) {
        return {
            sql: `DELETE FROM ${model.name} 
            WHERE ${args.col} = $${args.index++}::${args.type}
            RETURNING *;`,
            data: [id]
        }
    }
}

/**
 * Generate transaction query: Create plpgsql function to
 * run prepared statements.
 *
 * @param {Array} statements
 * @param {Object} args
 * @return {String} sql query
 * @public
 */

export function transact(statements, args) {

    // zip params with datatypes
    let paramsTyped = args.cols.map(
        function(key, _) {
        return [key, args.types[key]].join(" ");
    });

    return `
            BEGIN;
            CREATE OR REPLACE FUNCTION ${args.fname}(${paramsTyped.join(",")}) RETURNS void AS 
            $$
            BEGIN
                DROP FUNCTION ${args.fname}(${paramsTyped.types.join(",")};
                ${statements.join(";\n")};
            END;
            $$ 
            LANGUAGE plpgsql;
            COMMIT;
            SELECT ${args.fname}($1::varchar, $2::varchar, $3::varchar, $4::varchar);
            `
}

/**
 * Collate item data as array of values.
 *
 * @param {Object} item
 * @param {Object} args
 * @return {Array} collated model data
 */

function collate(
    item,
    args={
        where: null,
        whereType: null,
        ignore:[],
        timestamps: ['created_at', 'updated_at']
    }) {

    // reserve first position for where condition
    let data = args.where ? [item.fields[args.where].value] : [];

    // filter input data to match insert/update parameters
    data.push(... Object.keys(item.fields)
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






