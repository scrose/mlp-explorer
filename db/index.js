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

const params = require('../params');
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
const client = new Client(config);
client.connect();



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

// subquery for transactions
function subquery(queryText, params, callback) {
    client.query(queryText, params, (err, res) => {
        if (shouldAbort(err)) return
        // check if any queries remain

        const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
        const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
        client.query(insertPhotoText, insertPhotoValues, (err, res) => {
            if (shouldAbort(err)) return

        })
    })
}

function commit(done) {
    client.query('COMMIT', err => {
        if (err) {
            console.error('Error committing transaction', err.stack)
        }
        done()
    })
}

// Single query
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






