#!/usr/bin/env node

/**
 * Module dependencies
 */

import express from 'express';
import Queue from 'bull';
import { transcode } from '../src/services/images.services.js';
// import heapdump from 'heapdump';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Create Transcoder application.
 * @private
 */

/**
 * Initialize main Express instance.
 */

const app = express();

/**
 * Get port from environment and store in Express
 */

const host = process.env.REDIS_HOST || 'http://localhost';
const port = process.env.REDIS_PORT || 6379;
app.set('port', port);

app.get('/', (req, res) => {
    res.send('No Access')
})

app.listen(port, () => {
    console.log(`Transcoder listening on ${host}:${port}`);
    console.log('\n- (Node) Exposed Garbage Collection:', !!global.gc);
});

/**
 * Connect to Redis message broker
 * @private
 */

let queue = new Queue('transcode', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

queue.process(async (job) => {

    const { src='' } = job.data || {};

    console.log(`Processing job: ${job.id} / File: ${src}`);

    transcode(job.data, console.log)
        .then(res => {
            console.log(`[Completed] Job: ${job.id} / File: ${src}`);

            // heapdump.writeSnapshot(function(err, filename) {
            //     console.log('dump written to', filename);
            // });

        })
        .catch(console.error)
        .finally(() => {
            console.log('Garbage Collection ...')
        // force garbage collection
        if (typeof global.gc != "undefined") {
            const gcRes = global.gc();
            console.log('\t- [Node] Force GC:', gcRes);
        }
    });
});