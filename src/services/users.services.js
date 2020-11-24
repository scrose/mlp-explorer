/*!
 * MLP.Core.Services.Users
 * File: users.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import query from './database.js';
import { admin } from '../config';

/**
 * Find user by ID. Joined with user roles table.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

export function findById(id) {
  return query(
    'SELECT\n' +
      '    users.user_id AS user_id,\n' +
      '    user_roles.role_id AS role_id,\n' +
      '    user_roles.name AS role,\n' +
      '    users.email,\n' +
      '    users.reset_password_token,\n' +
      '    users.reset_password_expires,\n' +
      '    users.created_at,\n' +
      '    users.updated_at\n' +
      'FROM users\n' +
      'LEFT OUTER JOIN user_roles\n' +
      'ON users.role_id = user_roles.role_id\n' +
      'WHERE users.user_id=$1::varchar',
    [id]
  );
}

/**
 * Find user by email.
 *
 * @public
 * @param {String} email
 * @return {Promise} result
 */

// export function findByEmail(email) {
//   return query('SELECT * FROM users WHERE users.email = $1::text LIMIT 1, [email]);
// }

/**
 * Find all registered users.
 *
 * @public
 * @return {Promise} result
 */

export function findAll() {
  return query(
    'SELECT\n' +
      '    users.user_id AS user_id,\n' +
      '    user_roles.role_id AS role_id,\n' +
      '    user_roles.name AS role,\n' +
      '    users.email,\n' +
      '    users.created_at,\n' +
      '    users.updated_at\n' +
      'FROM users\n' +
      'LEFT OUTER JOIN user_roles\n' +
      'ON users.role_id = user_roles.role_id',
    []
  );
}

/**
 * Update user data.
 *
 * @public
 * @param {Object} data
 * @return {Promise} result
 */

export function update(data) {
  return query(
    'UPDATE users\n' +
      'SET\n' +
      'email = $2::text,\n' +
      'role_id = $3::integer,\n' +
      'updated_at = NOW()::timestamp\n' +
      'WHERE\n' +
      'user_id = $1::varchar\n' +
      'AND\n' +
      'role_id != 5\n' +
      'RETURNING *',
    [data.user_id, data.email, data.role_id]
  );
}

/**
 * Insert new user.
 *
 * @public
 * @param {Object} data
 * @return {Promise} result
 */

export function insert(data) {
  return query(
    `INSERT INTO users(
                  user_id, 
                  email, 
                  password, 
                  salt_token, 
                  role_id, 
                  created_at, 
                  updated_at
        ) VALUES(
                 $1::varchar, 
                 $2::varchar, 
                 $3::varchar, 
                 $4::varchar, 
                 $5::integer, 
                 NOW()::timestamp, 
                 NOW()::timestamp
                 ) 
        RETURNING user_id`,
    [data.user_id, data.email, data.password, data.salt_token, data.role_id]
  );
}

/**
 * Delete user.
 *
 * @public
 * @param {int} id
 * @return {Promise} result
 */

export function remove(id) {
  return query(
    `DELETE FROM users
            WHERE user_id = $1::varchar
              AND role_id != 5
                RETURNING *`,
    [id]
  );
}

/**
 * Initialize users table
 *
 * @public
 * @param {object} data
 * @return {Promise} result
 */

export function init(data) {
  return query(
    `CREATE TABLE IF NOT EXISTS user_roles (
    id serial PRIMARY KEY,
    role_id SMALLINT UNIQUE NOT NULL,
    name VARCHAR (255) UNIQUE NOT NULL);
INSERT INTO user_roles (role_id, name) VALUES (1, 'Registered');
INSERT INTO user_roles (role_id, name) VALUES (2, 'Editor');
INSERT INTO user_roles (role_id, name) VALUES (3, 'Contributor');
INSERT INTO user_roles (role_id, name) VALUES (4, 'Administrator');
INSERT INTO user_roles (role_id, name) VALUES (5, 'Super-Administrator');
CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    user_id VARCHAR (255) UNIQUE NOT NULL,
    role_id SMALLINT NOT NULL DEFAULT 1,
    email VARCHAR (255) UNIQUE NOT NULL,
    password VARCHAR (512) NOT NULL,
    salt_token VARCHAR (255) NOT NULL,
    reset_password_token VARCHAR (255),
    reset_password_expires TIMESTAMP,
    last_sign_in_at TIMESTAMP,
    last_sign_in_ip VARCHAR (255),
    created_at TIMESTAMP,
    pdated_at TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id),
    CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,63}$'),
    CHECK (password ~* '^[a-fA-F0-9]+$'),
    CHECK (salt_token ~* '^[a-fA-F0-9]+$')
    );
    INSERT INTO users(
              user_id,
              email,
              password,
              salt_token,
              role_id,
              created_at,
              updated_at
              )
          VALUES(
                 $1::varchar,
                 $2::varchar,
                 $3::varchar,
                 $4::varchar,
                 5,
                 NOW()::timestamp,
                 NOW()::timestamp\n
                 )
        RETURNING *;`,
    [admin.user_id, admin.email, admin.hash, admin.salt_token]
  );
}
