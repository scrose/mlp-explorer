/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.DataAPI
  Filename:     db/main.js
  ------------------------------------------------------
  Binding for data layer API - PostgreSQL / pg-promise.
  Key Functionality
  - Binds controllers to data layer / services.
  - Binds pg-promise database queries and data exports.
  - Options for search and node tree export data formats.
  - Uses reusable connection pool to check out, use, return.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: September 23, 2020
  ======================================================
*/

'use strict';

// initialize connection pool / client
const params = require('../config');
const {Pool, Client} = require('pg');
const config = {
    user: params.db.username,
    database: params.db.database,
    password: params.db.password,
    host: params.db.hostname,
    port: params.db.port,
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000
};
const pool = new Pool(config);
// const client = new Client(config);
// client.connect();


// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

// get table schema
function getSchema(queryText) {
    return async () => {
        const {rows} = await db.query(queryText, []);
        return rows.reduce((a, x) => ({...a, [x.column_name]: x}), {})
    }
}


// export database data layer API (DataAPI)
module.exports = {
    query: (text, params) => pool.query(text, params),
    // query: (queryText, params, callback) => {
    //     const start = Date.now()
    //     return pool.query(queryText, params, (err, res) => {
    //         // console.log(queryText)
    //         if (err) {
    //             throw err
    //         } else {
    //             const duration = Date.now() - start
    //             console.log('DB: Executed query', {queryText, params, duration, rows: res.rowCount})
    //         }
    //         callback(err, res)
    //     })
    // },
    multiquery: (queryText, params, callback) => {
        pool.connect((err, client, done) => {
            const shouldAbort = err => {
                if (err) {
                    console.error('Error in transaction', err.stack)
                    client.query('ROLLBACK', err => {
                        if (err) {
                            console.error('Error rolling back client', err.stack)
                        }
                        // release the client back to the pool
                        done()
                    })
                }
                return !!err
            }
        })
    }
}






