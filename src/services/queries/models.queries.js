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

export function findById(table) {
    return `SELECT * FROM ${table} WHERE id = $1::varchar`;
}

/**
 * Find all records.
 */

export function findAll(table) {
    return `SELECT * FROM ${table}`;
}

/**
 * Update model data.
 */

export function update(table, data) {
    let query = `UPDATE ${table} SET email = $2::text,
                           role_id = $3::integer,
                           updated_at = NOW()::timestamp`;
    Object.entries(data).forEach(([key, value]) => {
        console.log(key, value);
    })
    query += `WHERE user_id = $1::varchar AND role_id < 5 RETURNING *`;
    return query;
}

/**
 * Insert new user.
 */

export const insert =
        `INSERT INTO users(user_id,
                           email,
                           password,
                           salt_token,
                           role_id,
                           created_at,
                           updated_at)
         VALUES ($1::varchar,
                 $2::varchar,
                 $3::varchar,
                 $4::varchar,
                 $5::integer,
                 NOW()::timestamp,
                 NOW()::timestamp)
         RETURNING user_id`;

/**
 * Delete user.
 */

export const remove = `DELETE
                       FROM users
                       WHERE user_id = $1::varchar
                         AND role_id != 5
                       RETURNING *`;

/**
 * Initialize users table
 */

export const init = {
    create: ``,
    exec: ``
};

