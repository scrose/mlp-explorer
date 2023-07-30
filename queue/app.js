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
import {stat} from "fs/promises";
import {deleteFiles, insertFile} from "../src/services/files.services.js";
import {copyImageTo, getImageInfo} from "../src/services/images.services.js";
import pool from "../src/services/db.services.js";
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

/**
 * Process image files.
 *
 * @public
 * @return {Promise} result
 * @param data
 * @param callback
 */

export const imageProcessor = async (data, callback) => {

    // extract queued data
    const {
        src = '',
        // filename = '',
        metadata = {},
        versions = {},
        owner = {},
        imageState = '',
        options = {},
    } = data || {};
    let isRAW = false;
    let copySrc = src;

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {

        // read temporary image into buffer memory
        // record buffer size as file size
        //let buffer = await readFile(src);
        await stat(src).then(stats => {
            metadata.file.file_size = stats.size;
        });

        //
        // // convert RAW image to tiff
        // // Reference: https://github.com/zfedoran/dcraw.js/
        // let bufferRaw = dcraw(buffer, {
        //     useEmbeddedColorMatrix: true,
        //     exportAsTiff: true,
        //     useExportMode: true,
        // });
        //
        // // create temporary file for upload (if format is supported)
        // if (bufferRaw) {
        //     const tmpName = Math.random().toString(16).substring(2) + '-' + filename;
        //     copySrc = path.join(process.env.TMP_DIR, path.basename(tmpName));
        //     await writeFile(copySrc, bufferRaw);
        //     isRAW = true;
        // }
        // delete buffer
        // buffer = null;
        // bufferRaw = null;

        // get image metadata
        await getImageInfo(copySrc, metadata, options, isRAW);

        // add file record to database
        await insertFile(metadata, owner, imageState, callback, client);

        // copy image versions to data storage
        await copyImageTo(src, versions.raw);
        await copyImageTo(copySrc, versions.medium);
        await copyImageTo(copySrc, versions.thumb);
        await copyImageTo(copySrc, versions.full);

        // delete temporary files
        src === copySrc
            ? await deleteFiles([src])
            : await deleteFiles([src, copySrc])

        return {
            raw: isRAW,
            src: copySrc,
            metadata: metadata,
        };
    } catch (err) {
        callback(err);
    } finally {
        await client.release(true);
    }
};

try {
    let queue = new Queue('imageProcessor', {
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