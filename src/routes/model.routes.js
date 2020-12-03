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
import controller from '../controllers/model.controller.js';
import { restrict } from '../lib/permissions.utils.js';
import path from "path";
import {models} from '../config.js'

/**
 * Express router
 */

let router = express.Router();
export default router;

/**
 * Model route constructor
 */

function Routes(model) {

    // create model id key
    this.key = model + '_id';

    // initialize model controller
    this.controller = controller.create(model);

    // add controllers
    this.routes = {
        list: {
            id: null,
            path: path.join('/', model),
            get: this.controller.list,
            put: null,
            post: null,
            delete: null
        },
        show: {
            path: path.join('/', model, '/:' + this.key),
            get: this.controller.show,
            put: null,
            post: null,
            delete: null
        },
        add: {
            path: path.join('/', model, '/:' + this.key + '/add'),
            get: this.controller.add,
            put: null,
            post: this.controller.create,
            delete: null
        },
        edit: {
            path: path.join('/', model, '/:' + this.key + '/edit'),
            get: this.controller.edit,
            put: null,
            post: this.controller.update,
            delete: null
        },
        remove: {
            path: path.join('/', model, '/:' + this.key + '/remove'),
            get: this.controller.remove,
            put: null,
            post: this.controller.drop,
            delete: null
        }
    }
}

/**
 * Routes initialization.
 */

Object.entries(models).forEach(([modelName, params]) => {
        let routes = new Routes(modelName);

        // controller initialization
        router.use(routes.controller.init)

        // add default routes
        Object.entries(routes.routes).forEach(([view, route]) => {
            router.route(route.path)
                .all(function (req, res, next) {
                    // get model ID parameter (if exists)
                    let modelId = req.params.hasOwnProperty(routes.key)
                        ? req.params[routes.key]
                        : null;

                    // restrict user access based on permissions
                    restrict(res, next, {
                        model: modelName,
                        view: view,
                        id: modelId
                    });
                })
                .get(function (req, res, next) {
                    route.get || next(new Error('notImplemented'))
                })
                .put(function (req, res, next) {
                    route.put || next(new Error('notImplemented'))
                })
                .post(function (req, res, next) {
                    route.post || next(new Error('notImplemented'))
                })
                .delete(function (req, res, next) {
                    route.delete || next(new Error('notImplemented'))
                })
        });
    }
);