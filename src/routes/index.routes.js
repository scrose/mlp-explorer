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
import metadata from './metadata.routes.js'
import files from './files.routes.js'

/**
 * Create base router to add routes.
 */

const baseRouter = express.Router({strict: true});
export default baseRouter;

/**
 * Routes initialization. Routes only generated for
 * defined models in the node_types relation.
 */

async function initRoutes(routes, baseRouter) {

    // Generate secondary express router
    let router = express.Router({strict: true});

    // get user permission settings
    let permissions = await schema.getPermissions();

    // add API endpoints
    Object.entries(routes.routes).forEach(([view, route]) => {
        console.log(route)
        router.route(route.path)
            .all(async (req, res, next) => {
                try {

                    // initialize controller
                    await routes.controller.init(req, res, next)
                        .catch(err => {
                            throw err;
                        });

                    // filter permissions for given view
                    const allowedRoles = permissions
                        .filter(viewPermissions => {
                            return viewPermissions.view === view;
                        })
                        .map(permission => {
                            return permission.role;
                        });

                    // authorize user access based on role permissions
                    // - user data set to null for anonymous users (visitors)
                    const { access_token=null } = req.signedCookies || [];

                    req.user = await auth.authorize(access_token, allowedRoles)
                        .catch(err => {
                            throw err;
                        });

                }
                catch (err) {
                    return next(err);
                }
                next();
            })
            .get(function(req, res, next) {
                if (!route.get)
                    return next(new Error(`${view} [get] route not implemented.`));
                route.get(req, res, next);
            })
            .put(function(req, res, next) {
                if (!route.put)
                    return next(new Error(`${view} [put] route not implemented.`));
                route.put(req, res, next);
            })
            .post(function(req, res, next) {
                if (!route.post)
                    return next(new Error(`${view} [post] route not implemented.`));
                route.post(req, res, next);
            })
            .delete(function(req, res, next) {
                if (!route.delete)
                    return next(new Error(`${view} [delete] route not implemented.`));
                route.delete(req, res, next);
            });

        // add secondary router to main router
        baseRouter.use('', router);
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
        .map(routes => initRoutes(routes, baseRouter));

    // initialize metadata routes
    const metadataRoutes = await metadata();
    metadataRoutes
        .map(routes => initRoutes(routes, baseRouter));

    // initialize file routes
    const filesRoutes = await files();
    filesRoutes
        .map(routes => initRoutes(routes, baseRouter))
}
initRouter().catch(err => {throw err});
