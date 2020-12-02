/*!
 * MLP.API.Utilities.Secure
 * File: /lib/secure.utils.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import crypto from 'crypto';
import uid from 'uid-safe';

/**
 * Generate standard UUID.
 *
 * @public
 * @return {String} UUID
 */

export function genUUID() {
  return uid.sync(36);
}

/**
 * Generate Random ID (16 bytes)
 *
 * @public
 * @return {String} Random ID
 */

export function genID() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Encrypt string
 *
 * @public
 * @param {String} str
 * @param {String} salt
 * @return {String} encrypted string
 */

export function encrypt(str, salt) {
  return crypto.pbkdf2Sync(str, salt, 1000, 64, `sha512`).toString(`hex`);
}

/**
 * Encrypt user salt and password
 *
 * @public
 */

export function encryptUser(user) {
    let password = user.getValue('password') || null;
    if (!password) return;

    // generate unique identifier for user (user_id)
    user.setValue('user_id', genUUID());
    // Generate unique hash and salt tokens
    let salt_token = genID();
    let hash_token = encrypt(password, salt_token);
    // Set values in schema
    user.setValue('password', hash_token);
    user.setValue('repeat_password', hash_token);
    user.setValue('salt_token', salt_token);
}

/**
 * Authenticate user password.
 *
 * @public
 * @param {Object} user
 * @param {String} password
 * @return {Boolean} response
 */

export function authenticate(user, password) {
    return user.getValue('password') === encrypt(password, user.getValue('salt_token'));
}
