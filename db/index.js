/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.DataAPI
  Filename:     db/index.js
  ------------------------------------------------------
  Binding for data layer API - PostgreSQL / pg-promise.
  Key Functionality
  - Binds controllers to data layer / model.
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

// const pgp = require('pg-promise')(/* options */)
const params = require('../params');
// const { Pool, Client } = require('pg')
//
// const prefix = "postgres://";
// const connectionString = prefix + params.db.username + ':' + params.db.password + '@' + params.db.hostname + ':' + params.db.port + '/' + params.db.database;
//
//
// const pool = new Pool({
//     connectionString: connectionString,
// })

// pool.query('SELECT NOW()', (err, res) => {
//     console.log(err, res)
//     pool.end()
// })

const {Pool} = require('pg');

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

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

module.exports = {
    query: (sql, params, callback) => {
        const start = Date.now()
        return pool.query(sql, params, (err, res) => {
            if (err) {
                throw err
            } else {
                const duration = Date.now() - start
                console.log('DB: Executed query', {sql, params, duration, rows: res.rowCount})
            }
            callback(err, res)
        })
    },
}