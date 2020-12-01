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
    general: {
        projectName: "Mountain Legacy Project",
        appName: "Explorer",
        title: "Welcome to the Mountain Legacy Project Explorer"
    },
    admin: {

    },
    roles: {
        Visitor: 0,
        Registered: 1,
        Editor: 2,
        Contributor: 3,
        Administrator: 4,
        Super_Administrator: 5
    },
    permissions: {
        default: {
            show: "Visitor",
            list: "Visitor",
            edit: "Contributor",
            create: "Editor",
            remove: "Editor"
        },
        users: {
            show: "Administrator",
            list: "Administrator",
            edit: "Administrator",
            create: "Administrator",
            remove: "Administrator",
            register: "Administrator",
            login: "Visitor",
            logout: "Visitor"
        }
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
export const general = settings.general;
export const roles = settings.roles;
export const session = settings.session;
export const permissions = settings.permissions;

console.log('Settings loaded.')
