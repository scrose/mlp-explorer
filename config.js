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
        projects: {
            owner: null
        },
        surveyors: {
            owner: null
        },
        surveys: {
            owner: 'surveyors'
        },
        surveySeasons: {
            owner: 'surveys'
        },
        stations: {
            owner: null
        },
        visits: {
            owner: 'stations'
        },
        historicVisits: {
            owner: 'stations'
        },
        locations: {
            owner: 'stations'
        },
        historicCaptures: {
            owner: null
        },
        captures: {
            owner: null
        },
        captureImages: {
            owner: null
        },
        images: {
            owner: null
        },
        cameras: {
            owner: null
        },
        metadataFiles: {
            owner: null
        },
        glassPlateListings: {
            owner: 'survey_seasons'
        },
        maps: {
            owner: 'survey_seasons'
        },
        participants: {
            owner: null
        },
        participantGroups: {
            owner: 'visits'
        },
        shutterSpeed: {
            owner: null
        },
        iso: {
            owner: null
        }
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