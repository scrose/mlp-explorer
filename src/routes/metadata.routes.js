/*!
 * Core.API.Router.Metadata
 * File: metadata.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies
 */

import * as schema from '../services/schema.services.js';
import path from 'path';
import MetadataController from '../controllers/metadata.controller.js';

/**
 * Nodes routes constructor
 *
 * @param {String} metadataType
 * @public
 */

function MetadataRoutes(metadataType) {

    // create model identifier key
    this.model = metadataType;
    this.key = `${metadataType}_id`;

    // initialize metadata controller
    this.controller = new MetadataController(this.model);

    // define models that group metadata
    const groupedModels = ['participant_groups'];
    const optionModels = ['cameras', 'lens', 'participants', 'participant_group_types', 'image_types'];

    // add controller routes
    this.routes = {
        settings: {
            path: path.join('/settings'),
            get: this.controller.settings,
            put: null,
            post: null,
            delete: null,
        },
        options: {
            path: path.join('/options'),
            get: this.controller.options,
            put: null,
            post: null,
            delete: null,
        },
        show: {
            path: path.join('/', this.model, 'show', ':' + this.key),
            get: this.controller.show,
            put: null,
            post: null,
            delete: null,
        },
        create: {
            path: optionModels.includes(this.model)
                ? path.join('/', this.model, 'new')
                : path.join('/', this.model, 'new',  ':owner_id'),
            get: null,
            put: null,
            post: groupedModels.includes(this.model)
                ? this.controller.createGroup
                : this.controller.create,
            delete: null
        },
        edit: {
            path: path.join('/', this.model, 'edit', ':' + this.key),
            get: null,
            put: null,
            post: groupedModels.includes(this.model)
                ? this.controller.updateGroup
                : this.controller.update,
            delete: null,
        },
        remove: {
            path: groupedModels.includes(this.model)
                ? path.join('/', this.model, 'remove', ':owner_id', ':group_type')
                : path.join('/', this.model, 'remove', ':' + this.key),
            get: null,
            put: null,
            post: groupedModels.includes(this.model)
                ? this.controller.removeGroup
                : this.controller.remove,
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

    // metadata
    await schema.getMetadataTypes()
        .then(metadataTypes => {
            metadataTypes.map(metadataType => {
                // add routes instance to array
                routes.push(new MetadataRoutes(metadataType));
            });
        })
        .catch(err => {throw err});

    return routes;
}


