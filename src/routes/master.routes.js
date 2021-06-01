/*!
 * Core.API.Router.Master
 * File: master.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies
 */

import path from 'path';
import MasterController from '../controllers/master.controller.js';


/**
 * Master routes constructor
 *
 * @public
 */

function MasterRoutes(modelType) {

    // create model identifier key
    this.model = modelType;
    this.key = `${modelType}_id`;

    // initialize model controller
    this.controller = new MasterController(modelType);

    // add controller routes
    // include master endpoint for modern capture images
    this.routes = {
        master: {
            path: path.join('/', this.model, 'master', ':' + this.key),
            get: this.controller.register,
            put: null,
            post: this.controller.master,
            delete: null,
        }
    };
}


/**
 * Master routes initialization. Routes only generated for
 * defined models used in image registration.
 */

export default async function generate() {
    let routes = [];
    routes.push(new MasterRoutes('historic_images'));
    routes.push(new MasterRoutes('modern_images'));
    return routes;
}