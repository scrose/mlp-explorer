/*!
 * MLP.API.Services.Queries.Users
 * File: users.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
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
        sql: `SELECT *
              FROM users
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
        sql: `SELECT users.user_id      AS user_id,
                     user_roles.role_id AS role_id,
                     user_roles.name    AS role,
                     users.email,
                     users.created_at,
                     users.updated_at
              FROM users
                       LEFT OUTER JOIN user_roles
                                       ON users.role_id = user_roles.role_id`,
        data: [],
    };
}

/**
 * Update user data.
 *
 * @param {Object} user
 * @return {Function} SQL query function
 */

export function update(user) {
    let data = user.getData();
    return {
        sql: `UPDATE users
              SET email      = $2::text,
                  role_id    = $3::integer,
                  updated_at = NOW()::timestamp
              WHERE user_id = $1::varchar
                AND role_id < 5
              RETURNING *`,
        data: [data.user_id, data.email, data.role_id],
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
              RETURNING user_id, email`,
        data: [data.user_id, data.email, data.password, data.salt_token, data.role_id],
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
                AND role_id != 5
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
    return [
        {
            sql: `CREATE TABLE IF NOT EXISTS user_roles
                  (
                      id      serial PRIMARY KEY,
                      role_id SMALLINT UNIQUE     NOT NULL,
                      name    VARCHAR(255) UNIQUE NOT NULL
                  );`,
            data: [],
        },
        {
            sql: `CREATE TABLE IF NOT EXISTS users
                  (
                      id                     serial PRIMARY KEY,
                      user_id                VARCHAR(255) UNIQUE NOT NULL,
                      role_id                SMALLINT            NOT NULL DEFAULT 1,
                      email                  VARCHAR(255) UNIQUE NOT NULL,
                      password               VARCHAR(512)        NOT NULL,
                      salt_token             VARCHAR(255)        NOT NULL,
                      reset_password_token   VARCHAR(255),
                      reset_password_expires TIMESTAMP,
                      last_sign_in_at        TIMESTAMP,
                      last_sign_in_ip        VARCHAR(255),
                      created_at             TIMESTAMP,
                      updated_at             TIMESTAMP,
                      FOREIGN KEY (role_id) REFERENCES user_roles (role_id),
                      CHECK (email~*'^[a-zA-Z0-9_+&-]+(?:.[a-zA-Z0-9_+&-]+)*@(?:[a-zA-Z0-9-]+.)+[a-zA-Z]{2,7}$'),
                      CHECK (password~*'^[a-fA-F0-9]+$'),
                      CHECK (salt_token~*'^[a-fA-F0-9]+$')
                  );`,
            data: [],
        },
        {
            sql: `INSERT INTO user_roles (role_id, name)
                  VALUES (1, 'Registered')
                  ON CONFLICT (role_id) DO UPDATE
                      SET role_id = 1,
                          name    = 'Registered';`,
            data: [],
        },
        {
            sql: `INSERT INTO user_roles (role_id, name)
                  VALUES (2, 'Editor')
                  ON CONFLICT (role_id) DO UPDATE
                      SET role_id = 2,
                          name    = 'Editor';`,
            data: [],
        },
        {
            sql: `INSERT INTO user_roles (role_id, name)
                  VALUES (3, 'Contributor')
                  ON CONFLICT (role_id) DO UPDATE
                      SET role_id = 3,
                          name    = 'Contributor';`,
            data: [],
        },
        {
            sql: `INSERT INTO user_roles (role_id, name)
                  VALUES (4, 'Administrator')
                  ON CONFLICT (role_id) DO UPDATE
                      SET role_id = 4,
                          name    = 'Administrator';`,
            data: [],
        },
        {
            sql: `INSERT INTO user_roles (role_id, name)
                  VALUES (5, 'Super-Administrator')
                  ON CONFLICT (role_id) DO UPDATE
                      SET role_id = 5,
                          name    = 'Super-Administrator';`,
            data: [],
        },
        {
            sql: `INSERT INTO users(user_id,
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
                          5,
                          NOW()::timestamp,
                          NOW()::timestamp)
                  ON CONFLICT (user_id) DO UPDATE
                      SET user_id    = $1::varchar,
                          email      = $2::varchar,
                          password   = $3::varchar,
                          salt_token = $4::varchar,
                          role_id    = 5,
                          created_at = NOW()::timestamp,
                          updated_at = NOW()::timestamp;`,
            data: data,
        }];

}
