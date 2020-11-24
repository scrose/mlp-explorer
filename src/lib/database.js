/*!
 * MLP.Core.Database
 * File: /services/database.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Initialize connection pool / client
 *
 * @public
 */

import pg from 'pg';
import { db } from '../config.js';

const config = {
  user: db.username,
  database: db.database,
  password: db.password,
  host: db.hostname,
  port: db.port,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000,
};

/**
 * Create client pool to allow for reusable pool of
 * clients to check out, use, and return.
 */

const pool = new pg.Pool(config);

/**
 * Pool will emit an error on behalf of any idle clients
 * it contains if a backend error or network partition
 * happens.
 */
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// export database data layer API (DataAPI)
export default function query(sql, params) {
  return pool.query(sql, params);
}
