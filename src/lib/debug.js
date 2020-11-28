/*!
 * MLP.API.Utilities.Debug
 * File: /lib/debug.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Debug logger.
 * @param type
 * @private
 */

export default function (type) {
  return function (msg, err) {
    if (process.env.DEBUG === 1) console.log(msg);
    if (err) console.log(err);
  };
}
