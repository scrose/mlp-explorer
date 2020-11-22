/*!
 * MLP.Core.Utilities.Debug
 * File: /lib/debug.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';
const config = require('../config');

// Group JSON array rows by common key
// REFERENCE: https://stackoverflow.com/a/38575908
module.exports.debugger = (type) => {
    return function debug( msg, err ) {
        if (config.debug[type])
            console.log(msg);
            if (err)
                console.log(err)
    }
};
