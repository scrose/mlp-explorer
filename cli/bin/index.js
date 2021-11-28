#!/usr/bin/env node

/**
 * Explorer Command-line Application
 */

/**
 * Module dependencies.
 * @private
 */

import queries from '../../src/queries/index.queries.js';
import fs from "fs";
import pg from "pg";
import dotenv from 'dotenv';
import Jimp from "jimp";
dotenv.config({ path: '../.env' });

/**
 * Create client pool to allow for reusable pool of
 * clients to check out, use, and return.
 */

const pool = new pg.Pool({
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    max: 20, // max number of clients in the pool
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 10000
});

/**
 * Pool will emit an error on behalf of any idle clients
 * it contains if a backend error or network partition
 * happens.
 */

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err, client);
    process.exit(-1);
});

pool.on('acquire', function (client) {});
pool.on('connect', function (err, client, release) {});
pool.on('remove', function () {});

// note if arguments are missing
if (process.argv.length < 3) {
    console.warn('Missing arguments.');
}

// process the command args
process.argv.forEach(function (val, index, array) {
    if (index === 2) {
        let op = val;
    }
});

// regenerate files
const client = await pool.connect();

try {
    let sqlStmt = queries.files.getFilesByType('modern_images');
    let result = await pool.query(sqlStmt.sql, sqlStmt.data);
    result.rows.forEach(imgData => {
        console.log(imgData);
        // resample and copy file to data storage
        Jimp.read(imgData.fs_path)
            .then(img => {
                return img
                    .resize(2100, Jimp.AUTO)
                    .quality(80) // set JPEG quality
                    .write(process.env.LOWRES_PATH)
            });

        console.log(`Image ${src}: \n\t- resampled to ${output.size}px width \n\t- saved to ${output.path}.`);
    })

} catch (err) {
    console.error(err);
} finally {
    client.release(true);
}

