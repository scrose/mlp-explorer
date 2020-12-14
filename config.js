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
    roles: {
        visitor: 0,
        registered: 1,
        editor: 2,
        contributor: 3,
        administrator: 4,
        superAdministrator: 5
    },
    debug: {
        sessions: false
    },
    session: {
        ttl: 3600,
        pruneInterval: 10000
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

console.log('Settings loaded.')
