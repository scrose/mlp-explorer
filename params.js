
// Parameter settings

'use strict';

// Load paths file directly
const fs = require('fs');

// Load JSON settings
let paths_data = fs.readFileSync('./paths.json').toString();
let paths = JSON.parse(paths_data);
let settings_data = fs.readFileSync(paths.settings).toString();
let settings = JSON.parse(settings_data);
let routes_data = fs.readFileSync(paths.routes).toString();
let routes = JSON.parse(routes_data);

console.log('Settings have been read.');

// Expose module data
module.exports.settings = settings;
module.exports.port = settings.server.port || process.env.port || 3000;
module.exports.hostname = settings.server.hostname;
module.exports.paths = paths;
module.exports.routes = routes;
module.exports.db = settings.db;
module.exports.server = settings.server;
