/*!
 * MLP.API.Utilities.Debug
 * File: /lib/debug.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import { debug as config } from '../config.js';

/**
 * Debug logger.
 * @param type
 * @private
 */

export default function (type) {
  return function (msg, err) {
    if (config[type]) console.log(msg);
    if (err) console.log(err);
  };
}
