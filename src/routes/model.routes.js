/*!
 * Core.API.Router.Default
 * File: users.routes.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies
 */

import express from 'express'
import Controller from '../controllers/model.controller.js';
import { restrict } from '../lib/permissions.utils.js';
import path from "path";
import {models} from '../../config.js'

/**
 * Express router
 */

let router = express.Router();
export default router;

/**
 * Model route constructor
 *
 * @param {String} modelName
 * @public
 */

function Routes(modelName) {

    // create model id key
    this.key = modelName + '_id';

    // initialize model controller
    this.controller = new Controller(modelName);

    // add controller routes
    this.routes = {
        list: {
            id: null,
            path: path.join('/', modelName),
            get: this.controller.list,
            put: null,
            post: null,
            delete: null
        },
        add: {
            path: path.join('/', modelName, 'add'),
            get: this.controller.add,
            put: null,
            post: this.controller.create,
            delete: null
        },
        show: {
            path: path.join('/', modelName, '/:' + this.key),
            get: this.controller.show,
            put: null,
            post: null,
            delete: null
        },
        edit: {
            path: path.join('/', modelName, '/:' + this.key, 'edit'),
            get: this.controller.edit,
            put: null,
            post: this.controller.update,
            delete: null
        },
        remove: {
            path: path.join('/', modelName, '/:' + this.key, 'remove'),
            get: this.controller.remove,
            put: null,
            post: this.controller.drop,
            delete: null
        }
    }
}

/**
 * Routes initialization. Routes are only generated for
 * models in the configuration settings (config.js).
 *
 */

Object.entries(models).forEach(([modelName, params]) => {

        // TODO: handle dependent models
        // Object.entries(params).forEach((depModelName) => {}));

        let routes = new Routes(modelName);

        // controller initialization
        router.use(routes.controller.init)

        // add default routes
        Object.entries(routes.routes).forEach(([view, route]) => {
            router.route(route.path)
                .all(function (req, res, next) {

                    // get model ID parameter (if exists)
                    let reqId = req.params.hasOwnProperty(routes.key)
                        ? req.params[routes.key]
                        : null;

                    // restrict user access based on permissions
                    restrict(res, next, {
                        model: modelName,
                        view: view,
                        id: reqId
                    });

                })
                .get(function (req, res, next) {
                    if (!route.get) next(new Error('notImplemented'))
                    route.get(req, res, next)
                })
                .put(function (req, res, next) {
                    if (!route.put) next(new Error('notImplemented'))
                    route.put(req, res, next)
                })
                .post(function (req, res, next) {
                    if (!route.post) next(new Error('notImplemented'))
                    route.post(req, res, next)
                })
                .delete(function (req, res, next) {
                    if (!route.delete) next(new Error('notImplemented'))
                    route.delete(req, res, next)
                })
        });
    }
);