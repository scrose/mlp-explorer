/*!
 * MLP.Core.Services.Roles
 * File: roles.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

import query from './database.js';

/**
 * Find all user roles.
 *
 * @public
 */

export function findAll() {
  return query(`SELECT *\n` + 'FROM user_roles\n' + `ORDER BY role_id ASC`, []);
}

/**
 * Update user role.
 *
 * @param {Object} data
 * @public
 */

export function update(data) {
  return query(
      `UPDATE user_roles SET name = $2::varchar WHERE role_id = $1::varchar RETURNING *`,
      [data.name]);
}

/**
 * Insert user role.
 *
 * @param {Object} data
 * @public
 */

export function insert(data) {
  return query(
      `INSERT INTO user_roles(name) VALUES($1::varchar) RETURNING *`,
      [data.name]);
}

/**
 * Delete user role.
 *
 * @public
 */

export function remove(id) {
  return query(
      `DELETE FROM user_roles WHERE role_id = $1::varchar RETURNING *`, [id]);
}
