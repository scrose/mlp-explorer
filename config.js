
// Parameter settings

'use strict';

// Load paths file directly
const fs = require('fs');

// Load JSON settings
let settingsFile = fs.readFileSync('/Users/boutrous/Workspace/NodeJS/config.json').toString();
let settings = JSON.parse(settingsFile);

// --- backend/config.js ---
// export const {
//     PORT = settings.server.port || process.env.port || 3000,
//     NODE_ENV = 'development'
//     SESS_NAME = 'sid',
//     SESS_SECRET = 'secret!session',
//     SESS_LIFETIME = 1000 * 60 * 60 * 2
//     CONFIG_PATH = '/Users/boutrous/Workspace/NodeJS/config.json'
// } = process.env;

// Expose module data
module.exports.settings = settings;
module.exports.debug = settings.debug
module.exports.port = settings.server.port || process.env.port || 3000;
module.exports.hostname = settings.server.hostname;
module.exports.db = settings.db;
module.exports.server = settings.server;
module.exports.session = settings.session;



