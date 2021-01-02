/*!
 * Core.API.Router.Models
 * File: models.routes.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies
 */

import express from 'express';
import Controller from '../controllers/models.controller.js';
import { restrict } from '../lib/permissions.utils.js';
import path from 'path';
import { toSnake } from '../lib/data.utils.js';
import * as schema from '../services/schema.construct.services.js';

/**
 * Express router
 */

let router = express.Router();
export default router;

/**
 * Model route constructor
 *
 * @param {String} modelType
 * @public
 */

function Routes(modelType) {

    // create model identifier key
    this.modelRoute = toSnake(modelType);
    this.key = `${toSnake(modelType)}_id`;

    // initialize model controller
    this.controller = new Controller(this.modelRoute);

    // add controller routes
    this.routes = {
        list: {
            path: path.join('/', this.modelRoute),
            get: this.controller.list,
            put: null,
            post: null,
            delete: null,
        },
        create: {
            path: path.join('/', this.modelRoute, 'add'),
            get: this.controller.add,
            put: null,
            post: this.controller.create,
            delete: null,
        },
        show: {
            path: path.join('/', this.modelRoute, '/:' + this.key),
            get: this.controller.show,
            put: null,
            post: null,
            delete: null,
        },
        edit: {
            path: path.join('/', this.modelRoute, '/:' + this.key, 'edit'),
            get: this.controller.edit,
            put: null,
            post: this.controller.update,
            delete: null,
        },
        remove: {
            path: path.join('/', this.modelRoute, '/:' + this.key, 'remove'),
            get: this.controller.remove,
            put: null,
            post: this.controller.drop,
            delete: null,
        },
    };
}

/**
 * Routes initialization. Routes only generated for
 * defined models in the node_types relation.
 *
 */

async function initRoutes() {

    // get user permissions
    let permissions = await schema.getPermissions();

    await schema.getTypes()
        .then((modelTypes) => {
            modelTypes.forEach(modelType => {

                // create routes instance
                let routes = new Routes(modelType);

                // add default routes
                Object.entries(routes.routes).forEach(([view, route]) => {

                    router.route(route.path)
                        .all(function(req, res, next) {

                            // get model ID parameter (if exists)
                            let reqId = req.params.hasOwnProperty(routes.key)
                                ? req.params[routes.key]
                                : null;

                            // restrict user access based on permissions
                            restrict(res, next, {
                                permissions: permissions,
                                model: modelType,
                                view: view,
                                id: reqId,
                            });

                        })
                        .all(function(req, res, next) {
                        // initialize controller
                        routes.controller.init(req, res, next);
                    })
                        .get(function(req, res, next) {
                            if (!route.get) next(new Error('notImplemented'));
                            route.get(req, res, next);
                        })
                        .put(function(req, res, next) {
                            if (!route.put) next(new Error('notImplemented'));
                            route.put(req, res, next);
                        })
                        .post(function(req, res, next) {
                            if (!route.post) next(new Error('notImplemented'));
                            route.post(req, res, next);
                        })
                        .delete(function(req, res, next) {
                            if (!route.delete) next(new Error('notImplemented'));
                            route.delete(req, res, next);
                        });
                });
            });
        })
        .catch(err => {throw err});
}
initRoutes().catch(err => {throw err});


