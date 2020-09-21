'use strict';

// TODO: PosgreSQL Connection Pooling: Option production pooling = pgBouncer,
//  a lightweight connection pooler for PostgreSQL.
// https://pgdash.io/blog/pgbouncer-connection-pool.html

const pgp = require('pg-promise')(/* options */)
const params = require('../params');

// Load database settings
const prefix = "postgres://"
const port = params.db.port
const host = params.db.host
const username = params.db.username
const password = params.db.password
const database = params.db.database
const dbPath = new URL(prefix + username + ':' + password + '@' + host + ':' + port + '/' + database);

const dbConnection = pgp(dbPath.href);

// Database connection
module.exports = dbConnection;

