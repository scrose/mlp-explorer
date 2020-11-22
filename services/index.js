/*!
 * MLP.Core.Services
 * File: /services/index.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function getModels( params ) {
    if (!params.type) return;
    const serviceDir = path.join(__dirname, '..', 'services', params.type);

    // only map files to services
    if (!fs.statSync(serviceDir).isDirectory()) return;
    // check that file exists - sync
    try {
        require.resolve(serviceDir);
    } catch(err){
        console.log('\t%s services file does not exist', serviceDir)
        return err;
    }

    // get exported services
    const modelServices = require(serviceDir);
    const serviceHandlers = {}

    // Read queries into object
    for (const service in modelServices) {
        // "reserved" exported services
        if (~[].indexOf(service)) continue;
        // get sql query filename
        const queryfile = path.join(serviceDir, 'queries', service + '.sql');
        // check that query file exists
        try {
            if (fs.existsSync(queryfile)) {
                // load sql from query file
                const queryText = fs.readFileSync(queryfile, 'utf8')
                serviceHandlers[service] = modelServices[service](queryText);
            } else {
                serviceHandlers[service] = modelServices[service];
            }
        } catch(err) {
            console.error(err);
            return err;
        }
    }
    // show resultant queries lookup
    return serviceHandlers
};


