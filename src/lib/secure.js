/*!
 * MLP.Core.Utilities.Secure
 * File: /lib/secure.js
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
