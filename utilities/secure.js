/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Utilities.Data
  File:         /utilities/data.js
  ------------------------------------------------------
  Utility methods for handling data
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 9, 2020
  ======================================================
*/

'use strict';
const date = require('./date');
const crypto = require('crypto');
const uid = require('uid-safe')

// Generate UUID
exports.genUUID = async function () {
    return await uid(128, function (err, string) {
        if (err) throw err
        console.log(string)
    })
};

// Generate Random ID (16 bytes)
exports.genID = function () {
    return crypto.randomBytes(16).toString('hex')
};


// Encrypt string
exports.encrypt = function (string, salt) {
    return crypto.pbkdf2Sync(string, salt,
        1000, 64, `sha512`).toString(`hex`)
}
