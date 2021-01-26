/*!
 * Core.API.Router
 * File: index.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies
 */

import * as main from '../controllers/main.controller.js';

/**
 * Express router
 */
let routes = new MainRoutes();
export default routes;

/**
 * Frontpage.
 */

/**
 * Default routes constructor
 *
 * @public
 */

function MainRoutes() {

    // initialize model controller
    this.controller = main;

    // add controller routes
    this.routes = {
        show: {
            path: '/',
            get: this.controller.show,
            put: null,
            post: null,
            delete: null,
        },
        list: {
            path: '/nodes',
            get: this.controller.list,
            put: null,
            post: null,
            delete: null,
        }
    }
}
