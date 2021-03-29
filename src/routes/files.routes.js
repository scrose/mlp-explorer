/*!
 * Core.API.Router.Files
 * File: files.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */


/**
 * Module dependencies
 */

import path from 'path';
import FilesController from '../controllers/files.controller.js'
import { getFileTypes } from '../services/schema.services.js';

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
        show: {
            path: path.join('/', this.model, 'show', ':' + this.key),
            get: this.controller.show,
            put: null,
            post: null,
            delete: null,
        },
        edit: {
            path: path.join('/', this.model, 'edit', ':' + this.key),
            get: this.controller.edit,
            put: null,
            post: this.controller.update,
            delete: null,
        },
        download: {
            path: path.join('/', this.model, 'download', ':' + this.key),
            get: null,
            put: null,
            post: this.controller.download,
            delete: null,
        },
        upload: {
            path: path.join('/', this.model, 'upload', ':' + this.key),
            get: this.controller.browse,
            put: null,
            post: this.controller.upload,
            delete: null,
        },
        master: {
            path: path.join('/', this.model, 'master', ':' + this.key),
            get: this.controller.master,
            put: null,
            post: null,
            delete: null,
        },
    };
}

/**
 * Files routes initialization. Routes only generated for
 * defined models in the file_types relation.
 */

export default async function generate() {
    let routes = [];
    await getFileTypes()
        .then(fileTypes => {
            fileTypes.map(fileType => {
                // add routes instance to array
                routes.push(new FilesRoutes(fileType));
            });
        })
        .catch(err => {throw err});
    return routes;
}