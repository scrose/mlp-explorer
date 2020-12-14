/*!
 * Core.API.Router.Users
 * File: users.routes.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */


/**
 * Module dependencies
 */

import express from 'express';
import * as users from '../controllers/users.controller.js'
import { restrict } from '../lib/permissions.utils.js';
import path from 'path';
import * as schema from '../services/schema.construct.services.js';

/**
 * Express router
 */

let router = express.Router();
export default router;

/**
 * Model user route constructor
 *
 * @public
 */

function UserRoutes() {

    // create model identifier key
    this.modelRoute = 'users';
    this.key = 'user_id';

    // initialize model controller
    this.controller = users;

    // add controller routes
    this.routes = {
        list: {
            path: path.join('/', this.modelRoute),
            get: this.controller.list,
            put: null,
            post: null,
            delete: null,
        },
        register: {
            path: path.join('/', this.modelRoute, 'register'),
            get: this.controller.register,
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
        login: {
            path: path.join('/login'),
            get: this.controller.login,
            put: null,
            post: this.controller.authenticate,
            delete: null,
        },
        logout: {
            path: path.join('/logout'),
            get: this.controller.logout,
            put: null,
            post: null,
            delete: null,
        }
    };
}

/**
 * Routes initialization. Routes only generated for
 * defined models in the node_types relation.
 *
 */

async function initRoutes() {

    // create user routes instance
    let routes = new UserRoutes();

    // get user permissions
    let permissions = await schema.getPermissions();

    // controller initialization
    router.use(users.init);

    // add user routes
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
                    model: 'users',
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
    });
}
initRoutes().catch(err => {throw err});