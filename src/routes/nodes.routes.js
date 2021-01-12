/*!
 * Core.API.Router.Nodes
 * File: nodes.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies
 */

import NodesController from '../controllers/nodes.controller.js';
import { toSnake } from '../lib/data.utils.js';
import * as schema from '../services/schema.services.js';
import path from 'path';

/**
 * Nodes routes constructor
 *
 * @param {String} modelType
 * @public
 */

function NodesRoutes(modelType) {

    // create model identifier key
    this.model = toSnake(modelType);
    this.key = `${toSnake(modelType)}_id`;

    // initialize model controller
    this.controller = new NodesController(this.model);

    // add controller routes
    this.routes = {
        list: {
            path: path.join('/', this.model),
            get: this.controller.list,
            put: null,
            post: null,
            delete: null,
        },
        create: {
            path: path.join('/', this.model, 'add'),
            get: this.controller.add,
            put: null,
            post: this.controller.create,
            delete: null,
        },
        show: {
            path: path.join('/', this.model, '/:' + this.key),
            get: this.controller.show,
            put: null,
            post: null,
            delete: null,
        },
        edit: {
            path: path.join('/', this.model, '/:' + this.key, 'edit'),
            get: this.controller.edit,
            put: null,
            post: this.controller.update,
            delete: null,
        },
        remove: {
            path: path.join('/', this.model, '/:' + this.key, 'remove'),
            get: this.controller.remove,
            put: null,
            post: this.controller.drop,
            delete: null,
        },
    };
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
                routes.push(new NodesRoutes(nodeType));
            });
        })
        .catch(err => {throw err});
    return routes;
}

