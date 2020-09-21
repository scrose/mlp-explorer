
// Parameter settings

'use strict';
let ut = require('./utilities/file');

// Load paths file directly
const fs = require('fs');
let paths_data = fs.readFileSync('/Users/boutrous/Workspace/NodeJS/mlp-explorer/paths.json');
let paths = JSON.parse(paths_data);

let settings = ut.loadJSON(paths.settings);

// Expose module data
module.exports.boiler = settings.general;
module.exports.port = 3000;
module.exports.paths = paths;
module.exports.db = ut.loadJSON(paths.db).db;
