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

// Load database settings
const prefix = "postgres://";
const port = params.db.port;
const hostname = params.db.hostname;
const username = params.db.username;
const password = params.db.password;
const database = params.db.database;
const dbPath = new URL(prefix + username + ':' + password + '@' + hostname + ':' + port + '/' + database);
console.log(dbPath);

const { Pool } = require('pg')
const pool = new Pool(dbPath)

module.exports = {
    query: (text, params) => pool.query(text, params),
}