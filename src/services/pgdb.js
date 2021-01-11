/*!
 * MLP.API.Library.Database
 * File: database.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Initialize connection pool / client
 *
 * @public
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config()

/**
 * Create client pool to allow for reusable pool of
 * clients to check out, use, and return.
 */

const pgPool = new pg.Pool({
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000,
});


/**
 * Pool will emit an error on behalf of any idle clients
 * it contains if a backend error or network partition
 * happens.
 */
pgPool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err, client);
  process.exit(-1);
});

/**
 * Export pg-pool object instance.
 */

export default pgPool;
