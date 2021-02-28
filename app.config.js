/*!
 * MLP.API.Config
 * File: app.config.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import dotenv from 'dotenv';

/**
 * Application settings
 * @private
 */

let settings = {
    debug: {
        sessions: false
    },
    session: {
        ttl: 3600,
        pruneInterval: 10000
    },
    imageSizes: {
        thumb: {
            width: 150
        },
        medium: {
            width: 900
        }
    }
}

/**
 * Load environment variables.
 * @private
 */
// require('dotenv').config({ path: '/full/custom/path/to/your/env/vars' })
const result = dotenv.config();
if (result.error) {
    throw result.error
}

/**
 * Expose module settings.
 * @public
 */
export const session = settings.session;
export const imageSizes = settings.imageSizes;

console.log('Settings loaded.')
