/*!
 * Core.API.Router.Main
 * File: main.routes.js
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
        export: {
            path: '/admin/logs',
            get: this.controller.logs,
            put: null,
            post: null,
            delete: null,
        }
    }
}
