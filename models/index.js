/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.DataAPI
  Filename:     db/main.js
  ------------------------------------------------------
  Binding for data layer API - PostgreSQL / pg-promise.
  Key Functionality
  - Binds controllers to data layer / models.
  - Binds pg-promise database queries and data exports.
  - Options for search and node tree export data formats.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: September 23, 2020
  ======================================================
    TODO: PosgreSQL Connection Pooling: Option production
     pooling = pgBouncer, a lightweight connection pooler for PostgreSQL.
    https://pgdash.io/blog/pgbouncer-connection-pool.html
*/

'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function getModels(model){
    if (!model.type) return
    const modelDir = path.join(__dirname, '..', 'models', model.type);
    console.log(modelDir)

    // only map files to models
    if (!fs.statSync(modelDir).isDirectory()) return;
    // check that file exists - sync
    try {
        require.resolve(modelDir);
    } catch(e){
        console.log('\t%s index file does not exist', modelDir)
        return
    }

    const obj = require(modelDir);
    const modelHandlers = {}

    // Read queries into object
    for (const method in obj) {
        // "reserved" exports
        if (~['name', 'prefix', 'engine', 'before'].indexOf(method)) continue;
        // model exports
        const queryfile = path.join(modelDir, 'queries', method + '.sql');
        // check that query file exists
        try {
            if (fs.existsSync(queryfile)) {
                const queryText = fs.readFileSync(queryfile, 'utf8')
                modelHandlers[method] = obj[method](queryText);
            } else {
                modelHandlers[method] = obj[method];
            }
        } catch(err) {
            console.error(err)
        }
    }
    // show resultant queries lookup
    return modelHandlers
};


