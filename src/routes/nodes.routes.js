/*!
 * Core.API.Router.Nodes
 * File: nodes.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies
 */

import * as nodes from '../controllers/nodes.controller.js';
import path from "path";

/**
 * Express router
 */

let routes = new NodesRoutes();
export default routes;

/**
 * Default nodes routes constructor
 *
 * @public
 */

function NodesRoutes() {

    // initialize model controller
    this.controller = nodes;

    // add controller routes
    this.routes = {
        list: {
            path: '/nodes',
            get: this.controller.list,
            put: null,
            post: null,
            delete: null,
        },
        show: {
            path: path.join('/nodes/:id'),
            get: this.controller.show,
            put: null,
            post: null,
            delete: null,
        }
    }
}
