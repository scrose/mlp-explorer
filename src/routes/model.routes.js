/*!
 * Core.API.Router.Model
 * File: model.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies
 */

import ModelController from '../controllers/model.controller.js';
import * as schema from '../services/schema.services.js';
import path from 'path';

/**
 * Nodes routes constructor
 *
 * @param {String} modelType
 * @public
 */

function ModelRoutes(modelType) {

    // create model identifier key
    this.model = modelType;
    this.key = `${modelType}_id`;

    // initialize model controller
    this.controller = new ModelController(this.model);

    // add controller routes
    this.routes = {
        show: {
            path: path.join('/', this.model, 'show', ':' + this.key),
            get: this.controller.show,
            put: null,
            post: null,
            delete: null,
        },
        create: {
            path: this.model === 'surveyors' || this.model === 'projects'
                    ? path.join('/', this.model, 'new')
                    : path.join('/', this.model, 'new', ':owner_id'),
            get: this.controller.add,
            put: null,
            post: this.controller.create,
            delete: null,
        },
        edit: {
            path: path.join('/', this.model, 'edit', ':' + this.key),
            get: this.controller.edit,
            put: null,
            post: this.controller.update,
            delete: null,
        },
        move: {
            path: path.join('/', this.model, 'move', ':' + this.key),
            get: null,
            put: null,
            post: this.controller.move,
            delete: null,
        },
        remove: {
            path: path.join('/', this.model, 'remove', ':' + this.key),
            get: null,
            put: null,
            post: this.controller.remove,
            delete: null,
        }
    };

    // include import endpoint for bulk import of image captures
    if (this.model === 'historic_captures' || this.model === 'modern_captures') {
        this.routes.import = {
            path: path.join('/', this.model, 'import', ':owner_id'),
            get: null,
            put: null,
            post: this.controller.create,
            delete: null,
        }
    }
}

/**
 * Nodes Routes initialization. Routes only generated for
 * defined models in the node_types relation.
 */

export default async function generate() {
    let routes = [];
    await schema.getNodeTypes()
        .then(nodeTypes => {
            nodeTypes.map(nodeType => {
                // add routes instance to array
                routes.push(new ModelRoutes(nodeType));
            });
        })
        .catch(err => {throw err});
    return routes;
}


