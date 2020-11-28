'use strict';

/**
 * Module dependencies.
 * @private
 */

import fs from 'fs';
import dotenv from 'dotenv';

/**
 * Load JSON configuration file.
 * @private
 */

let settingsFile = '/Users/boutrous/Library/Mobile Documents/com~apple~CloudDocs/Workspace/Projects/mlp/config.json';
let settings = JSON.parse(fs.readFileSync(settingsFile).toString());

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
