/*!
 * MLP.API.Controllers.Nodes
 * File: nodes.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { prepare } from '../lib/api.utils.js';
import * as nserve from '../services/nodes.services.js';
import { sanitize } from '../lib/data.utils.js';

/**
 * Controller initialization.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const init = async (req, res, next) => {};

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
                data: {projects: projects, surveyors: surveyors},
            }));

    } catch (err) {
        return next(err);
    }
};
