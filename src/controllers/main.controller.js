/*!
 * MLP.API.Controllers.Main
 * File: main.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { prepare } from '../lib/api.utils.js';
import { getMetadataOptions } from '../services/metadata.services.js';
import pool from '../services/db.services.js';

/**
 * Controller initialization.
 *
 * @src public
 */

export const init = async () => {
};

/**
 * Default request controller.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const show = async (req, res, next) => {
    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {
        res.status(200).json(
            prepare({
                view: 'dashboard',
                options: await getMetadataOptions(client)
            }));
    } catch (err) {
        return next(err);
    }
    finally {
        client.release(true);
    }
};
