/*!
 * MLP.API.Models.Queries.Roles
 * File: roles.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Find all user roles.
 */

export const findAll = `SELECT *
                        FROM user_roles
                        ORDER BY role_id `;

/**
 * Update user role.
 */

export const update = `UPDATE user_roles SET name = $2::varchar WHERE role_id = $1::varchar RETURNING *`;

/**
 * Insert user role.
 */

export const insert = `INSERT INTO user_roles(name, role_id) VALUES($1::varchar, $2::integer) RETURNING *`;

/**
 * Delete user role.
 */

export const remove = `DELETE FROM user_roles WHERE role_id = $1::varchar RETURNING *`;
