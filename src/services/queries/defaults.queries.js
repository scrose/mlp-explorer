/*!
 * MLP.API.Services.Queries.Models
 * File: users.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Find record by ID.
 */

export function select(table) {
    return `SELECT * FROM ${table} WHERE id = $1::integer;`;
}

/**
 * Find all records.
 */

export function getAll(table) {
    return `SELECT * FROM ${table};`;
}

/**
 * Update model data.
 */

export function update(table, data) {
    let query = `UPDATE ${table} SET email = $2::text,
                           role_id = $3::integer,
                           updated_at = NOW()::timestamp`;

    query += `WHERE user_id = $1::varchar AND role_id < 5 RETURNING *`;
    return query;
}

/**
 * Insert new record.
 */

export function insert(model, data) {
    let cols = []
    let values = [];
    let dataArr = [];
    let ignore = ['id', 'created_at', 'updated_at']
    let i = 1;
    Object.entries(data)
        .filter(([key, value]) => {

            // throw error if schema does not have expected field
            if (!model.fields.hasOwnProperty(key)) throw new Error('invalidField');

            // ignore defined fields
            return !ignore.includes(key);
        })
        .forEach(([key, value]) => {
            const datatype = model.fields[key].type;
            dataArr.push(data[key])
            cols.push(`${key}`);
            values.push(`$${i}::${datatype}`);
            i++;
    });

    // include timestamps (if in schema)
    if (model.fields.hasOwnProperty('created_at')) {
        cols.push(`created_at`);
        values.push(`NOW()::timestamp`);
    }
    if (model.fields.hasOwnProperty('updated_at')){
        cols.push(`updated_at`);
        values.push(`NOW()::timestamp`);
    }

    let query = `INSERT INTO ${model.name} (${cols.join(",")}) VALUES (${values.join(",")}) RETURNING *;`;

    return {query, dataArr};
}

/**
 * Delete record.
 */

export function remove(table) {
    return `DELETE FROM ${table} WHERE id = $1::integer AND role_id > $2 RETURNING *;`;
}

/**
 * Initialize users table
 */

export const init = {
    create: ``,
    exec: ``
};

