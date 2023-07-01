/*!
 * Core.API.Router.Other
 * File: other.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies
 */

import * as otherController from '../controllers/other.controller.js';

/**
 * Express router
 */

let routes = new OtherRoutes();
export default routes;

/**
 * Define alternate and miscellaneous routes constructor
 *
 * @public
 */

function OtherRoutes() {

    // initialize node controller
    this.controller = otherController;

    // add controller routes
    this.routes = {
        filter: {
            path: '/showcase',
            get: this.controller.show,
            put: null,
            post: null,
            delete: null,
        }
    }
}
