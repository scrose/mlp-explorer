/*!
 * MLP.Core.Utilities.Secure
 * File: /_utilities/secure.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const crypto = require('crypto');
const uid = require("uid-safe");


/**
 * Generate standard UUID.
 *
 * @public
 * @return {String} UUID
 */

exports.genUUID = function () {
    return uid.sync(36);
};

/**
 * Generate Random ID (16 bytes)
 *
 * @public
 * @return {String} Random ID
 */

exports.genID = function () {
    return crypto.randomBytes(16).toString('hex')
};

/**
 * Encrypt string
 *
 * @public
 * @param {String} string
 * @param {String} salt
 * @return {String} encrpyted string
 */

exports.encrypt = function (string, salt) {
    return crypto.pbkdf2Sync(string, salt,
        1000, 64, `sha512`).toString(`hex`)
}
