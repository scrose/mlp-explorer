#!/usr/bin/env node

/*!
 * MLE.QUEUE
 * File: app.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Image processing queue API.
 *
 * ---------
 * Revisions
 * - 29-07-2023   Refactored out Redis connection as separate queue service.
 */

/**
 * Module dependencies
 */

import express from 'express';
import Queue from 'bull';
import {imageProcessor} from "./images.services.js";
// import heapdump from 'heapdump';

/**
 * Create Queue API application.
 * @private
 */

/**
 * Initialize main Express instance.
 */

const app = express();

/**
 * Get port from environment and store in Express
 */

const host = process.env.QUEUE_HOST;
const port = process.env.QUEUE_PORT;

// set queue port
app.set('port', port);

app.get('/', (req, res) => {
    res.send('No Access')
})

app.listen(port, () => {
    console.log(`Queue listening on ${host}:${port}`);
    console.log('\n- (Node) Exposed Garbage Collection:', !!global.gc);
});

/**
 * Connect to Redis message broker
 * @private
 */

try {
    let queue = new Queue('imageProcessor', {
        redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        },
    });

    queue.process(async (job) => {

        const {src = ''} = job.data || {};

        console.log(`Processing job: ${job.id} / File: ${src}`);

        imageProcessor(job.data, console.log)
            .then(() => {
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
}
catch (err) {
    console.error(err);
}