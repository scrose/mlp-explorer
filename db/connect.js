/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.DataAPI.DBConnection
  Filename:     db/connect.js
  Dependencies: pg
  ------------------------------------------------------
  Database connection object
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: September 23, 2020
  ======================================================
*/

'use strict';

// TODO: PosgreSQL Connection Pooling: Option production pooling = pgBouncer,
//  a lightweight connection pooler for PostgreSQL.
// https://pgdash.io/blog/pgbouncer-connection-pool.html

// const pgp = require('pg-promise')(/* options */)
const params = require('../params');
const { Client } = require('pg');
const client = new Client();

// establish connection
(async () => {
    await client.connect()
    // const res = await client.query('SELECT $1::text as message', ['Hello world!'])
    const res = await client.query('SELECT * FROM cameras', ['Hello world!'])
    console.log(res.rows[0].message) // Hello world!
    await client.end()
})()

// Load database settings
const prefix = "postgres://";
const port = params.db.port;
const host = params.db.host;
const username = params.db.username;
const password = params.db.password;
const database = params.db.database;
const dbPath = new URL(prefix + username + ':' + password + '@' + host + ':' + port + '/' + database);

const dbConnection = client(dbPath.href);

// Database connection
module.exports = dbConnection;

