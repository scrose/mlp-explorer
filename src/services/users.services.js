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
import fs from 'fs';
import query from './database.js';

/**
 * Initialize users table
 *
 * @public
 * @param {object} data
 * @return {Promise} result
 */

export function init(data) {
  const queryText = fs.readdirSync('./users/init.sql');
  return query(queryText, [data.user_id, data.email, data.password, data.salt_token]);
}

/**
 * Find user by ID.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

export function findById(id) {
  const queryText = fs.readdirSync('./users/findById.sql');
  return query(queryText, [id]);
}

/**
 * Find user by email.
 *
 * @public
 * @param {String} email
 * @return {Promise} result
 */

// export function findByEmail(email) {
//   const queryText = fs.readdirSync('./users/findByEmail.sql');
//   return query(queryText, [email]);
// }

/**
 * Find user by specified field.
 *
 * @public
 * @param {String} queryText
 * @return {Promise} result
 */

// export function findOne(field) {
//     const queryText = fs.readdirSync('./users/findByField.sql');
//     return query(queryText, [field]);
// }

/**
 * Find all registered users.
 *
 * @public
 * @return {Promise} result
 */

export function findAll() {
  const queryText = fs.readdirSync('./users/findAll.sql');
  return query(queryText, []);
}

/**
 * Update user data.
 *
 * @public
 * @param {Object} data
 * @return {Promise} result
 */

export function update(data) {
  const queryText = fs.readdirSync('./users/update.sql');
  return query(queryText, [data.user_id, data.email, data.role_id]);
}

/**
 * Insert new user.
 *
 * @public
 * @param {Object} data
 * @return {Promise} result
 */

export function insert(data) {
  const queryText = fs.readdirSync('./users/findByEmail.sql');
  return query(queryText, [data.user_id, data.email, data.password, data.salt_token, data.role_id]);
}

/**
 * Delete user.
 *
 * @public
 * @param {int} id
 * @return {Promise} result
 */

export function remove(id) {
  const queryText = fs.readdirSync('./users/delete.sql');
  return query(queryText, [id]);
}
