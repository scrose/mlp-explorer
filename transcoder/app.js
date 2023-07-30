#!/usr/bin/env node

/**
 * Module dependencies
 */

import express from 'express';
import Queue from 'bull';
import { transcode } from '../src/services/images.services.js';
// import heapdump from 'heapdump';

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

const host = process.env.TRANSCODER_HOST;
const port = process.env.TRANSCODER_PORT;
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

try {
    let queue = new Queue('transcode', {
        redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        },
    });

    // Removes everything but only if there are no active jobs
    await queue.obliterate();

    queue.process(async (job) => {

        const {src = ''} = job.data || {};

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
}
catch (err) {
    console.error(err);
}