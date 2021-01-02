/*!
 * Core.API.Router.Files
 * File: files.routes.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */


/**
 * Module dependencies
 */

import express from 'express';
import Uploader from '../controllers/files.controller.js'
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

function FilesRoutes() {

    // create model identifier key
    this.modelRoute = 'files';
    this.key = 'file_id';

    // initialize model controller
    this.controller = new Uploader();

    // add controller routes
    this.routes = {
        upload: {
            path: path.join('/upload'),
            get: this.controller.browse,
            put: null,
            post: this.controller.upload,
            delete: null,
        },
        // download: {
        //     path: path.join('/', this.modelRoute, '/download'),
        //     get: this.controller.select,
        //     put: null,
        //     post: this.controller.download,
        //     delete: null,
        // },
        // info: {
        //     path: path.join('/', this.modelRoute, '/:' + this.key),
        //     get: this.controller.browse,
        //     put: null,
        //     post: this.controller.upload,
        //     delete: null,
        // }
    };
}

/**
 * Routes initialization. Routes only generated for
 * defined models in the node_types relation.
 *
 */

async function initRoutes() {

    // create user routes instance
    let routes = new FilesRoutes();

    // get user permissions
    let permissions = await schema.getPermissions();

    // controller initialization
    router.use(routes.controller.init);

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
                    model: 'files',
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