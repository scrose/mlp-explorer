/*!
 * MLP.API.Utilities.Debug
 * File: /lib/debug.utils.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Debug logger.
 * @param {String} msg
 * @param {Error} err
 * @private
 */

export default function (msg, err=null) {
    if (process.env.DEBUG) console.log(msg);
    if (err) console.log(err);
}
