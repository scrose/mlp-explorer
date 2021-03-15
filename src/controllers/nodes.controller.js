/*!
 * MLP.API.Controllers.Nodes
 * File: nodes.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { prepare } from '../lib/api.utils.js';
import * as nserve from '../services/nodes.services.js';
import * as expserve from '../services/export.services.js';
import { sanitize } from '../lib/data.utils.js';
import { json2csv } from '../lib/file.utils.js';
import { ArrayStream } from '../services/files.services.js';

/**
 * Controller initialization.
 *
 * @src public
 */

export const init = async () => {};

/**
 * Show node data controller. Does not return dependents.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const show = async (req, res, next) => {
    try {

        const { id='' } = req.params || {};
        const node = await nserve.get(sanitize(id, 'integer'));

        res.status(200).json(
            prepare({
                view: 'show',
                data: node
            }));

    } catch (err) {
        return next(err);
    }
};

/**
 * All nodes request controller.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const list = async (req, res, next) => {
    try {

        // get surveyors and projects as root containers
        const projects = await nserve.getAll('projects');
        const surveyors = await nserve.getAll('surveyors');

        res.status(200).json(
            prepare({
                view: 'list',
                data: {
                    projects: projects,
                    surveyors: surveyors
                },
            }));

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
        const data = await expserve.get(schema);

        if (!data) return next(new Error('invalidRequest'));

        // create file stream
        const filename = `export_${schema}.${format}`;

        // file handlers router indexed by model type
        // Default: JSON data
        const exportHandler = {
            csv: () => {
                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
                return json2csv(data);

            },
            xml: () => {
                res.setHeader("Content-Type", "text/xml");
                res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
                // return json2xml(data);
            },
            default: () => {
                res.setHeader("Content-Type", "text/json");
                res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
            }
        };

        // route database callback after file upload
        const filtered = exportHandler.hasOwnProperty(format)
            ? exportHandler[format]()
            : exportHandler.default();

        // create data stream
        let rs = new ArrayStream(filtered);

        // return CSV data as file download
        rs.pipe(res).on('error', console.error);

    } catch (err) {
        console.error(err)
        next(err);
    }
};

