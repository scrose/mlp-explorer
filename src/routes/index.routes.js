/*!
 * Core.API.Router
 * File: index.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import express from 'express';
import * as schema from '../services/schema.services.js';
import { restrict } from '../lib/permissions.utils.js';
import main from './main.routes.js'
import users from './users.routes.js'
import nodes from './nodes.routes.js'
import files from './files.routes.js'

/**
 * Create base router to add routes.
 */

const baseRouter = express.Router();
export default baseRouter;

/**
 * Routes initialization. Routes only generated for
 * defined models in the node_types relation.
 */

async function initRoutes(routes, baseRouter) {

    // Generate secondary express router
    let router = express.Router();

    // get user permission settings
    let permissions = await schema.getPermissions();

    // apply controller initialization
    router.use(routes.controller.init);

    // add routes
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
                    model: routes.model,
                    view: view,
                    id: reqId,
                });

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

        // add secondary router to main router
        baseRouter.use('/', router);
    });
}

/**
 * Router initialization. Applies secondary routers to base router.
 */

async function initRouter() {

    // initialize main route
    baseRouter.use('/', main);

    // initialize user routes
    initRoutes(users, baseRouter)
        .catch(err => {throw err});

    // initialize nodes routes
    const nodesRoutes = await nodes();
    nodesRoutes
        .map(routes => initRoutes(routes, baseRouter))

    // initialize files routes
    const filesRoutes = await files();
    filesRoutes
        .map(routes => initRoutes(routes, baseRouter))
}
initRouter().catch(err => {throw err});
