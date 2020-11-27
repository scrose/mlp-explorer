/*!
 * MLP.API.Models.User
 * File: user.model.js
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
import { createModel } from './model.js';
import LocalError from './error.js';

/**
 * Create UserModel data model. Inherit
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
 * Use to confirm user is in database.
 *
 * @public
 * @return {Promise} result
 */

User.prototype.exists = function() {
    let id = this.getValue('user_id')
    return this.pool.query(queries.findById, [id]);
};

/**
 * Save user data to database. If
 *
 * @public
 * @param {Object} data
 * @return {Promise} result
 */

User.prototype.save = async function() {
    let data = this.getData();
    // check if user exists
    let exists = await this.exists().catch((_) => {throw new LocalError('nouser')})
    if (exists)
        return this.pool.query(
            queries.insert,
            [data.user_id, data.email, data.password, data.salt_token, data.role_id],
        );
    else
        return this.pool.query(
            queries.update,
            [data.user_id, data.email, data.role_id]
        );
};

/**
 * Delete user.
 *
 * @public
 * @param {Object} data
 * @return {Promise} result
 */

User.prototype.remove = function() {
    let id = this.getValue('user_id')
    return this.pool.query(queries.remove, [id]);
};

/**
 * Initialize users table
 *
 * @public
 * @param {object} data
 * @return {Promise} result
 */

User.prototype.initTable = function() {
    return this.pool.query(queries.init, []);
};

/**
 * Encrypt user salt and password
 *
 * @public
 */

User.prototype.encrypt = function() {
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
User.prototype.authenticate = function(password) {
    console.log('Authenticating user %s', this.getValue('email'));
    return this.getValue('password') === utils.secure.encrypt(password, this.getValue('salt_token'));
};
