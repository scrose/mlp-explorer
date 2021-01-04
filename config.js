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
const result = dotenv.config()

if (result.error) {
    throw result.error
}

/**
 * Expose module settings.
 * @public
 */
export const roles = settings.roles;
export const session = settings.session;
export const permissions = settings.permissions;
export const imageSizes = settings.imageSizes;

console.log('Settings loaded.')
