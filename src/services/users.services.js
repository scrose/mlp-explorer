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
    'INSERT INTO users(\n' +
      '    user_id,\n' +
      '    email,\n' +
      '    password,\n' +
      '    salt_token,\n' +
      '    role_id,\n' +
      '    created_at,\n' +
      '    updated_at\n' +
      ')\n' +
      'VALUES(\n' +
      '    $1::varchar,\n' +
      '    $2::varchar,\n' +
      '    $3::varchar,\n' +
      '    $4::varchar,\n' +
      '    $5::integer,\n' +
      '    NOW()::timestamp,\n' +
      '    NOW()::timestamp\n' +
      ')\n' +
      'RETURNING user_id',
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
    'DELETE FROM users\n' + 'WHERE\n' + 'user_id = $1::varchar\n' + 'AND\n' + 'role_id != 5\n' + 'RETURNING *',
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
    '-- Initialize Users Table\n' +
      '\n' +
      '-- drop old users table\n' +
      'DROP TABLE IF EXISTS users;\n' +
      '\n' +
      '-- drop old user roles table\n' +
      'DROP TABLE IF EXISTS user_roles;\n' +
      '\n' +
      '-- create user roles table\n' +
      'CREATE TABLE IF NOT EXISTS user_roles (\n' +
      'id serial PRIMARY KEY,\n' +
      'role_id SMALLINT UNIQUE NOT NULL,\n' +
      'name VARCHAR (255) UNIQUE NOT NULL\n' +
      ');\n' +
      '\n' +
      " INSERT INTO user_roles (role_id, name) VALUES (1, 'Registered');\n" +
      " INSERT INTO user_roles (role_id, name) VALUES (2, 'Editor');\n" +
      " INSERT INTO user_roles (role_id, name) VALUES (3, 'Contributor');\n" +
      " INSERT INTO user_roles (role_id, name) VALUES (4, 'Administrator');\n" +
      " INSERT INTO user_roles (role_id, name) VALUES (5, 'Super-Administrator');\n" +
      '\n' +
      'SELECT * FROM user_roles;\n' +
      '\n' +
      '\n' +
      '-- create new users table\n' +
      'CREATE TABLE IF NOT EXISTS users (\n' +
      '   id serial PRIMARY KEY,\n' +
      '   user_id VARCHAR (255) UNIQUE NOT NULL,\n' +
      '   role_id SMALLINT NOT NULL DEFAULT 1,\n' +
      '   email VARCHAR (255) UNIQUE NOT NULL,\n' +
      '   password VARCHAR (512) NOT NULL,\n' +
      '   salt_token VARCHAR (255) NOT NULL,\n' +
      '   reset_password_token VARCHAR (255),\n' +
      '   reset_password_expires TIMESTAMP,\n' +
      '   last_sign_in_at TIMESTAMP,\n' +
      '   last_sign_in_ip VARCHAR (255),\n' +
      '   created_at TIMESTAMP,\n' +
      '   updated_at TIMESTAMP,\n' +
      '   FOREIGN KEY (role_id) REFERENCES user_roles(role_id),\n' +
      "   CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,63}$'),\n" +
      "--   CHECK (user_id ~* '^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$'),\n" +
      "   CHECK (password ~* '^[a-fA-F0-9]+$'),\n" +
      "   CHECK (salt_token ~* '^[a-fA-F0-9]+$')\n" +
      ');\n' +
      '-- add super-administrator\n' +
      'INSERT INTO users(\n' +
      '    user_id,\n' +
      '    email,\n' +
      '    password,\n' +
      '    salt_token,\n' +
      '    role_id,\n' +
      '    created_at,\n' +
      '    updated_at\n' +
      ')\n' +
      'VALUES(\n' +
      '    $1::varchar,\n' +
      '    $2::varchar,\n' +
      '    $3::varchar,\n' +
      '    $4::varchar,\n' +
      '    5,\n' +
      '    NOW()::timestamp,\n' +
      '    NOW()::timestamp\n' +
      ')\n' +
      'RETURNING *;',
    [admin.user_id, admin.email, admin.hash, admin.salt_token]
  );
}
