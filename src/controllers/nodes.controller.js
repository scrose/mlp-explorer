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
import { ArrayStream } from '../services/files.services.js';
import { getAll } from '../services/metadata.services.js';

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
        const projects = await nserve.getTree('projects');
        const surveyors = await nserve.getTree('surveyors');

        res.status(200).json(
            prepare({
                view: 'tree',
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
 * Node tree request controller.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const map = async (req, res, next) => {
    try {

        // get surveyors and projects as root containers
        const data = await nserve.getMap();
        const options = {
            options: {
                surveyors_id: await getAll('surveyors'),
                surveys_id: await getAll('surveys'),
                survey_seasons_id: await getAll('survey_seasons')
            }
        }

        res.status(200).json(
            prepare({
                view: 'map',
                model: options,
                data: data,
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

/**
 * Search nodes using filter or query.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const search = async (req, res, next) => {
    try {

        // get query parameters
        const { q='', offset=0, limit=10 } = req.query || {};

        const resultData = await srchserve.fulltext(q, offset, limit);

        res.status(200).json(
            prepare({
                view: 'search',
                data: resultData
            }));

    } catch (err) {
        return next(err);
    }
};

