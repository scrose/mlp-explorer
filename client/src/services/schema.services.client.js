/*!
 * MLP.Client.Services.Schema
 * File: schema.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { schema } from '../schema';

/**
 * Load static view index.
 *
 * @public
 * @return {view, model, labels}
 * @param route
 */

export const getStaticView = (route) => {
    // get static routes
    const {router} = schema;

    if (!router.hasOwnProperty(route))
        return null;

    return router[route];
}

/**
 * Load view settings for view, model.
 *
 * @public
 * @param {String} view
 * @param {String} model
 * @return {view, model, labels}
 */

export const getSchema = (view, model=null) => {

    console.log('Getting view:', view, model)

    // assert view is in schema
    if (!schema.hasOwnProperty(view)) {
        return null;
    }

    // select view from app schema
    const viewSchema = schema[view];
    const viewAttributes = viewSchema.hasOwnProperty('attributes')
        ? viewSchema.attributes
        : {};

    // select model from view schema
    const modelName = model ? model : 'default';
    const modelSchema = viewSchema.hasOwnProperty(modelName)
        ? viewSchema[modelName]
        : {};

    // lookup field labels for model
    const labels = schema.labels.hasOwnProperty(modelName)
        ? schema.labels[modelName]
        : {};

    return {
        view: view,
        model: modelName,
        attributes: viewAttributes,
        schema: modelSchema,
        labels: labels
    }
}