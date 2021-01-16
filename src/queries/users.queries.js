/*!
 * MLP.API.Services.Queries.Users
 * File: users.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Find user by ID. Joined with user roles table.
 *
 * @param {String} user_id
 * @return {Function} SQL query function
 */

export function select(user_id) {
    return {
        sql: `SELECT user_roles.name, *
              FROM users
              LEFT OUTER JOIN user_roles
                  ON user_roles.name = users.role
              WHERE users.user_id = $1::varchar`,
        data: [user_id],
    };
}

/**
 * Find user by email. Joined with user roles table.
 *
 * @param {String} email
 * @return {Function} SQL query function
 */

export function selectByEmail(email) {
    return {
        sql: `SELECT *
              FROM users
              LEFT OUTER JOIN user_roles 
                  ON users.role = user_roles.name
              WHERE users.email = $1::varchar`,
        data: [email],
    };
}

/**
 * Find all registered users.
 *
 * @return {Function} SQL query function
 */

export function getAll() {
    return {
        sql: `SELECT users.user_id       AS user_id,
                     user_roles.name     AS role,
                     user_roles.label    AS role_label,
                     users.email,
                     users.created_at,
                     users.updated_at
              FROM users
                       LEFT OUTER JOIN user_roles
                                       ON users.role = user_roles.name`,
        data: [],
    };
}

/**
 * Update user data. Note that the super administrator
 * profile cannot be updated through the API, but only
 * through process environment variable.
 *
 * @param {Object} user
 * @return {Function} SQL query function
 */

export function update(user) {
    let data = user.getData();
    return {
        sql: `UPDATE users
              SET email      = $2::text,
                  role      =  $3::varchar,
                  updated_at = NOW()::timestamp
              WHERE user_id = $1::varchar
                AND role != 'super_administrator'
              RETURNING *`,
        data: [data.user_id, data.email, data.role],
    };
}

/**
 * Insert new user.
 *
 * @param {Object} user
 * @return {Function} SQL query function
 */

export function insert(user) {
    let data = user.getData();
    return {
        sql: `INSERT INTO users(user_id,
                                email,
                                password,
                                salt_token,
                                role,
                                created_at,
                                updated_at)
              VALUES ($1::varchar,
                      $2::varchar,
                      $3::varchar,
                      $4::varchar,
                      $5::varchar,
                      NOW()::timestamp,
                      NOW()::timestamp)
              RETURNING user_id, email, role`,
        data: [data.user_id, data.email, data.password, data.salt_token, data.role],
    };

}

/**
 * Delete user.
 *
 * @param {String} user_id
 * @return {Function} SQL query function
 */

export function remove(user_id) {
    return {
        sql: `DELETE
              FROM users
              WHERE user_id = $1::varchar
                AND role != 'super_administrator'
              RETURNING *`,
        data: [user_id],
    };
}

/**
 * Initialize user table in database.
 *
 * @param {Array} data
 * @return {Function} SQL query function
 */

export function init(data) {
    return [{
            sql: `INSERT INTO users(user_id,
                                    email,
                                    password,
                                    salt_token,
                                    role,
                                    created_at,
                                    updated_at)
                  VALUES ($1::varchar,
                          $2::varchar,
                          $3::varchar,
                          $4::varchar,
                          'super_administrator',
                          NOW()::timestamp,
                          NOW()::timestamp)
                  ON CONFLICT (user_id) DO NOTHING`,
            data: data,
        }];

}


/**
 * Get all user roles.
 *
 * @return {Function} SQL query function
 */

export function getRoles() {
    return {
        sql: `SELECT *
              FROM user_roles
              ORDER BY name`,
        data: [],
    };
}

/**
 * Update user role.
 *
 * @param {String} name
 * @param {String} label
 * @return {Function} SQL query function
 */

export function updateRole(name, label) {
    return {
        sql: `UPDATE user_roles
              SET 
                  name = $1::varchar, 
                  label = $1::varchar
              WHERE name = $1::varchar RETURNING *`,
        data: [name, label],
    };
}

/**
 * Insert user role.
 *
 * @param {String} name
 * @param {String} label
 * @return {Function} SQL query function
 */

export function insertRole(name, label) {
    return {
        sql: `INSERT INTO user_roles(name, label)
              VALUES($1::varchar, $2::integer) RETURNING *`,
        data: [name, label],
    };
}

/**
 * Delete user role.
 *
 * @param {String} name
 * @return {Function} SQL query function
 */

export function removeRole(name) {
    return {
        sql: `DELETE 
              FROM user_roles
              WHERE name = $1::varchar RETURNING *`,
        data: [name],
    };
}
