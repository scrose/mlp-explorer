/*!
 * MLP.API.Services.Queue
 * File: queue.services.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Queue API service implementation for Redis backend.
 *
 * ---------
 * Revisions
 * - 29-07-2023   Created new queue service.
 */

'use strict';

/**
 * Initialize redis connection
 *
 * @public
 */

import dotenv from 'dotenv';
import fetch from "node-fetch";
import Queue from "bull";
import redis from "redis";
dotenv.config();

/**
 * Create redis queue
 */


/**
 * Test Redis queue connection
 * @private
 */

export const ready = () => {
    return fetch(`${process.env.QUEUE_HOST}:${process.env.QUEUE_PORT}`)
        .then(() => { return true })
        .catch(err => {
            console.error('Queue API Error:', err);
            return false;
        });
}

/**
 * Connect to Redis message broker
 * - allows files to be queued for processing
 * @private
 */

let queue = new Queue('imageProcessor', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

// test Redis connection
const redisConnect = redis.createClient({
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

// handle Redis connection error
redisConnect.on('error', error => {
    console.error('ERROR initialising Redis connection', error.message);
});

// test Redis connection.
redisConnect.on('connect', async () => {
    console.log(
        `Connected to Redis: ${redisConnect.address}`,
    );
    console.log(`Queue API: ${await ready() ? 'Ready' : 'Not Ready'}`);
});

export default queue;

