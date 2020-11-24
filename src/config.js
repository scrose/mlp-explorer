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

/**
 * Expose module settings.
 * @public
 */
export const general = settings.general;
export const admin = settings.admin;
export const debug = settings.debug;
export const port = settings.server.port || process.env.port || 3000;
export const hostname = settings.server.hostname;
export const roles = settings.roles;
export const db = settings.db;
export const server = settings.server;
export const session = settings.session;
export const permissions = settings.permissions;
