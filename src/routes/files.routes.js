/*!
 * Core.API.Router.Files
 * File: files.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */


/**
 * Module dependencies
 */

import FilesController from '../controllers/files.controller.js'
import * as schema from '../services/schema.services.js';
import path from 'path';


/**
 * Files routes constructor
 *
 * @public
 */

function FilesRoutes(modelType) {

    // create model identifier key
    this.model = modelType;
    this.key = `${modelType}_id`;

    // initialize model controller
    this.controller = new FilesController(modelType);

    // add controller routes
    this.routes = {
        list: {
            path: path.join('/', this.model),
            get: this.controller.list,
            put: null,
            post: null,
            delete: null,
        },
        show: {
            path: path.join('/', this.model, '/:' + this.key),
            get: this.controller.show,
            put: null,
            post: null,
            delete: null,
        },
        upload: {
            path: path.join('/', this.model, '/upload'),
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
 * Files routes initialization. Routes only generated for
 * defined models in the file_types relation.
 */

export default async function generate() {
    let routes = [];
    await schema.getFileTypes()
        .then(fileTypes => {
            fileTypes.map(fileType => {
                // add routes instance to array
                routes.push(new FilesRoutes(fileType));
            });
        })
        .catch(err => {throw err});
    return routes;
}