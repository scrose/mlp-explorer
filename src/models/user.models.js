/*!
 * MLP.API.Models.User
 * File: user.composer.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import schema from './schemas/users.schema.js';
import { createModel } from './composer.js';
import { genID, genUUID, encrypt } from '../lib/secure.utils.js'

/**
 * Create UserModel data model. Inherit
 * methods, properties from Composer abstract class.
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
 * Encrypt user salt and password
 *
 * @public
 */

User.prototype.encrypt = function() {
    let password = this.getValue('password') || null;
    if (!password) return;

    // generate unique identifier for user (user_id)
    this.setValue('user_id', genUUID());
    // Generate unique hash and salt tokens
    let salt_token = genID();
    let hash_token = encrypt(password, salt_token);
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
    return this.getValue('password') === encrypt(password, this.getValue('salt_token'));
};
