/*!
 * MLP.Core.Services.Roles
 * File: roles.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

import fs from 'fs';
import query from './database.js';

/**
 * Find all user roles.
 *
 * @public
 */

export function findAll() {
  const queryText = fs.readdirSync('./roles/findAll.sql');
  return query(queryText, []);
}

/**
 * Update user role.
 *
 * @param {Object} data
 * @public
 */

export function update(data) {
  const queryText = fs.readdirSync('./roles/update.sql');
  return query(queryText, [data.name]);
}

/**
 * Insert user role.
 *
 * @param {Object} data
 * @public
 */

export function insert(data) {
  const queryText = fs.readdirSync('./roles/insert.sql');
  return query(queryText, [data.name]);
}

/**
 * Delete user role.
 *
 * @public
 */

export function remove(id) {
  const queryText = fs.readdirSync('./roles/delete.sql');
  return query(queryText, [id]);
}
