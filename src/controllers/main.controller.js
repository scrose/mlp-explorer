/*!
 * MLP.API.Controllers.Main
 * File: main.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { prepare } from '../lib/api.utils.js';
import * as ns from '../services/nodes.services.js';

/**
 * Controller initialization.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const init = async (req, res, next) => {
    return next();
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
  try {
      res.status(200).json(
          prepare({
              view: 'dashboard'
          }));
  } catch (err) {
    return next(err);
  }
};

/**
 * Nodes request controller.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const list = async (req, res, next) => {
    try {

        // get surveyors and projects as root containers
        const projects = await ns.getNodes('projects');
        const surveyors = await ns.getNodes('surveyors');

        // // get path of node in hierarchy
        // const path = await ns.getNodePath(item);
        //
        // // get linked data referenced in node tree
        // await ns.getDependents(item)
        //     .then(dependents => {
        //         res.status(200).json(
        //             prepare({
        //                 view: 'show',
        //                 model: model,
        //                 data: data,
        //                 path: path,
        //                 dependents: dependents
        //             }));
        //     })

        res.status(200).json(
            prepare({
                view: 'list',
                data: {projects: projects, surveyors: surveyors},
                dependents: {}
            }));
    } catch (err) {
        console.error(err)
        return next(err);
    }
};
