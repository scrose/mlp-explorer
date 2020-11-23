'use strict';

/**
 * Module dependencies.
 * @private
 */

import fs from 'fs';

/**
 * Load JSON configuration file.
 * @private
 */

let settingsFile = '/Users/boutrous/Workspace/NodeJS/config.json';
let settings = JSON.parse(fs.readFileSync(settingsFile).toString());

// --- backend/config.js ---
// export const {
//     PORT = settings.server.port || process.env.port || 3000,
//     NODE_ENV = 'development'
//     SESS_NAME = 'sid',
//     SESS_SECRET = 'secret!session',
//     SESS_LIFETIME = 1000 * 60 * 60 * 2
// } = process.env;

/**
 * Expose module settings.
 * @public
 */
export const general = settings.general;
export const debug = settings.debug;
export const port = settings.server.port || process.env.port || 3000;
export const hostname = settings.server.hostname;
export const roles = settings.roles;
export const db = settings.db;
export const server = settings.server;
export const session = settings.session;
export const permissions = settings.permissions;
