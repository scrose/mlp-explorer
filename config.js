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
    models: {
        projects: {},
        surveyors: {},
        surveys: {},
        surveySeasons: {},
        stations: {},
        visits: {},
        historicVisits: {},
        locations: {},
        historicCaptures: {},
        captures: {},
    },
    roles: {
        visitor: 0,
        registered: 1,
        editor: 2,
        contributor: 3,
        administrator: 4,
        superAdministrator: 5
    },
    permissions: {
        default: {
            show: "visitor",
            list: "visitor",
            edit: "contributor",
            create: "editor",
            remove: "editor"
        },
        users: {
            show: "administrator",
            list: "administrator",
            edit: "administrator",
            create: "administrator",
            remove: "administrator",
            register: "administrator",
            login: "visitor",
            logout: "visitor"
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
export const models = settings.models;
export const roles = settings.roles;
export const session = settings.session;
export const permissions = settings.permissions;

console.log('Settings loaded.')
