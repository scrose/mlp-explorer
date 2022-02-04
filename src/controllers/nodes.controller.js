/*!
 * MLP.API.Controllers.Nodes
 * File: nodes.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { prepare } from '../lib/api.utils.js';
import * as nserve from '../services/nodes.services.js';
import * as expserve from '../services/export.services.js';
import * as srchserve from '../services/search.services.js';
import { sanitize } from '../lib/data.utils.js';
import { json2csv } from '../lib/file.utils.js';
import { Readable } from 'stream';
import pool from '../services/db.services.js';

/**
 * Controller initialization.
 *
 * @src public
 */

export const init = async () => {};

/**
 * Show node data request controller. Does not return dependents.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const show = async (req, res, next) => {
    try {

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        const { id='' } = req.params || {};
        const node = await nserve.get(sanitize(id, 'integer'), client);

        res.status(200).json(
            prepare({
                view: 'show',
                data: node
            }));

        await client.release(true);

    } catch (err) {
        return next(err);
    }
};

/**
 * Node tree request controller.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const tree = async (req, res, next) => {

    try {

        // get surveyors and projects as root containers
        res.status(200).json(
            prepare({
                view: 'tree',
                data: {
                    nodes: {
                        surveyors: await nserve.getTree('surveyors'),
                        projects: await nserve.getTree('projects')
                    },
                }
            }));

    } catch (err) {
        return next(err);
    }
};

/**
 * Node tree request controller.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const map = async (req, res, next) => {
    try {

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        // get surveyors and projects as root containers
        res.status(200).json(
            prepare({
                view: 'map',
                data: {
                    nodes: await nserve.getMap() || []
                }
            }));

        await client.release(true);

    } catch (err) {
        return next(err);
    }
};

/**
 * Export node data request controller.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const exporter = async (req, res, next) => {
    try {

        const { format='', schema='default' } = req.params || {};

        // get data using requested export schema
        const exportData = await expserve.get(schema);

        if (!exportData) {
            return next(new Error('invalidRequest'));
        }

        // create file stream
        const filename = `export_${schema}.${format}`;

        // file handlers router indexed by model type
        // Default: JSON data
        const exportHandler = {
            csv: () => {
                res.set('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
                return json2csv(exportData);
            },
            xml: () => {
                res.setHeader("Content-Type", "text/xml");
                res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
                // return json2xml(data);
            },
            default: () => {
                res.setHeader("Content-Type", "text/json");
                res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
                return JSON.stringify(exportData);
            }
        };

        // route database callback after file upload
        const filtered = exportHandler.hasOwnProperty(format)
            ? exportHandler[format]()
            : exportHandler.default();

        // create data stream and pipe to response
        res.on('error', (err) => {
            console.error('Error in write stream:', err);
        });
        let rs = new Readable();
        rs._read = () => {}; // may be redundant
        rs.pipe(res);
        rs.on('error',function(err) {
                console.error(err)
                res.status(404).end();
            });
        rs.on('error',function(err) {
            console.error(err)
            res.status(404).end();
        });
        rs.push(filtered);
        rs.push(null);

    } catch (err) {
        console.error(err)
        return next(err);
    }
};

/**
 * Retrieves nodes using node ID filter.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const filter = async (req, res, next) => {

    try {

        // get query parameters
        const { ids='', offset=0, limit=10 } = req.query || {};

        // sanitize + convert query string to node id array
        const nodeIDs = ids
            .split(' ')
            .map(id => {
                return sanitize(id, 'integer');
            });

        // get results for each model requested
        const resultData = await nserve.filterNodesByID(nodeIDs, offset, limit);

        res.status(200).json(
            prepare({
                view: 'filter',
                data: resultData
            }));

    } catch (err) {
        return next(err);
    }
};

/**
 * Search nodes using search query.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const search = async (req, res, next) => {
    try {

        // get query parameters
        const { q='', offset=0, limit=10, filter=[] } = req.query || {};

        // get query results
        const resultData = await srchserve.fulltext(q, offset, limit, filter);

        res.status(200).json(
            prepare({
                view: 'search',
                data: resultData
            }));

    } catch (err) {
        return next(err);
    }
};

