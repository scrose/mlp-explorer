/*!
 * MLP.API.Models.User
 * File: User.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import schema from './schemas/users.schema.js';
import * as queries from './queries/users.queries.js';
import { createModel } from './Model.js';

/**
 * Create User data model. Inherit
 * methods, properties from Model abstract class.
 *
 * @private
 * @param data
 */

let User = createModel(schema);

/**
 * Module exports.
 * @public
 */

export default User;

/**
 * Find all registered users.
 *
 * @public
 * @return {Promise} result
 */

User.prototype.getAll = function () {
  return this.pool.query(queries.findAll, []);
};

/**
 * Find user by ID. Joined with user roles table.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

User.prototype.getById = function (user_id) {
  return this.pool.query(queries.findById, [user_id]);
};

/**
 * Update user data.
 *
 * @public
 * @param {Object} data
 * @return {Promise} result
 */

User.prototype.update = function (data) {
  return this.pool.query(queries.update, [data.user_id, data.email, data.role_id]);
};

/**
 * Insert new user.
 *
 * @public
 * @param {Object} data
 * @return {Promise} result
 */

User.prototype.add = function (data) {
  return this.pool.query(queries.insert, [data.user_id, data.email, data.password, data.salt_token, data.role_id]);
};

/**
 * Delete user.
 *
 * @public
 * @param {Object} data
 * @return {Promise} result
 */

User.prototype.remove = function (user_id) {
  return this.pool.query(queries.remove, [user_id]);
};

/**
 * Initialize users table
 *
 * @public
 * @param {object} data
 * @return {Promise} result
 */

User.prototype.initTable = function () {
  return this.pool.query(queries.init, []);
};

/**
 * Encrypt user salt and password
 *
 * @public
 */

User.prototype.encrypt = function () {
  let password = this.getValue('password') || null;
  if (!password) return;

  // generate unique identifier for user (user_id)
  this.setValue('user_id', utils.secure.genUUID());
  // Generate unique hash and salt tokens
  let salt_token = utils.secure.genID();
  let hash_token = utils.secure.encrypt(password, salt_token);
  // Set values in schema
  this.setValue('password', hash_token);
  this.setValue('repeat_password', hash_token);
  this.setValue('salt_token', salt_token);

  return this;
};

/**
 * Authenticate user credentials.
 * @public
 * @param {String} password
 */
User.prototype.authenticate = function (password) {
  console.log('Authenticating user %s', this.getValue('email'));
  return this.getValue('password') === utils.secure.encrypt(password, this.getValue('salt_token'));
};
