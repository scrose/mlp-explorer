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
import * as auth from '../services/auth.services.js'
import main from './main.routes.js'
import users from './users.routes.js'
import nodes from './nodes.routes.js'
import models from './model.routes.js'
import files from './files.routes.js'
import { getPermissions } from '../lib/permissions.utils.js';

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

    // add routes
    Object.entries(routes.routes).forEach(([view, route]) => {
        router.route(route.path)
            .all(function(req, res, next) {
                // initialize controller
                routes.controller.init(req, res, next);
            })
            .all(function(req, res, next) {

                // get permissions settings (allowed user roles) for model, view
                const allowedRoles = getPermissions({
                    permissions: permissions,
                    model: routes.model,
                    view: view,
                    id: req.params.hasOwnProperty(routes.key) ? req.params[routes.key] : null,
                });

                // authorize user access based on role permissions
                req.user = auth.authorize(req, res, next, allowedRoles);

            })
            .get(function(req, res, next) {
                if (!route.get)
                    return next(new Error('notImplemented'));
                route.get(req, res, next);
            })
            .put(function(req, res, next) {
                if (!route.put)
                    return next(new Error('notImplemented'));
                route.put(req, res, next);
            })
            .post(function(req, res, next) {
                if (!route.post)
                    return next(new Error('notImplemented'));
                route.post(req, res, next);
            })
            .delete(function(req, res, next) {
                if (!route.delete)
                    return next(new Error('notImplemented'));
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

    // initialize main routes
    initRoutes(main, baseRouter)
        .catch(err => {throw err});

    // initialize user routes
    initRoutes(users, baseRouter)
        .catch(err => {throw err});

    // initialize node routes
    initRoutes(nodes, baseRouter)
        .catch(err => {throw err});

    // initialize model routes
    const modelsRoutes = await models();
    modelsRoutes
        .map(routes => initRoutes(routes, baseRouter))

    // initialize file routes
    const filesRoutes = await files();
    filesRoutes
        .map(routes => initRoutes(routes, baseRouter))
}
initRouter().catch(err => {throw err});
