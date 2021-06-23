#!/usr/bin/env node

/**
 * Module dependencies
 */

import express from 'express';
import Queue from 'bull';
import { transcode } from '../src/services/images.services.js';

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

const port = 3002;
app.set('port', port);

app.get('/', (req, res) => {
    res.send('No Access')
})

app.listen(port, () => {
    console.log(`Transcoder listening on http://localhost:${port}`)
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
        })
        .catch(console.error).finally(() => {
        // force garbage collection
        try {
            if (global.gc) {global.gc();}
        } catch (e) {
            console.log("`node --expose-gc index.js`");
            process.exit();
        }
    });
});