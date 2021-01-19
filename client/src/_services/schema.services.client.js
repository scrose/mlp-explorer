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
    const {routes} = schema;

    if (!routes.hasOwnProperty(route))
        return null;

    return routes[route];
}

/**
 * Get error message based on error type and key.
 *
 * @param {String} key
 * @param {String} type
 * @public
 */

export const getError = (key, type) => {
    const errorSchema = schema.errors.hasOwnProperty(type)
        ? schema.errors[type] : '';
    return errorSchema
        ? errorSchema.hasOwnProperty(key)
            ? errorSchema[key] : '' : '';
}

/**
 * Get top application page heading.
 *
 * @public
 */

export const getPageHeading = () => {
    return `${schema.main.appName}`;
}

/**
 * Load render settings for view/model.
 *
 * @public
 * @param {String} view
 * @return {String} view type
 */

export const getRenderType = (view) => {
    return schema.views.hasOwnProperty(view) ? schema.views[view].render : null;
}

/**
 * Get local client message.
 *
 * @public
 * @param {String} key
 * @param {String} type
 * @return {Object} message
 */

export const getLocalMsg = (key='', type='info') => {
    return schema.messages.hasOwnProperty(key)
        ? { msg: schema.messages[key], type: type }
        : {};
}

/**
 * Load view settings for model.
 *
 * @public
 * @param {String} view
 * @param {String} model
 * @param {Object} data
 * @return {{name: String, attributes: *, fields: {name: *, label: *, render: *|string, value: *|string}[]}}
 */

export const getSchema = (view, model, data=null) => {

    const modelSchema = schema.models.hasOwnProperty(model)
        ? schema.models[model] : {};
    const viewSchema = schema.views.hasOwnProperty(view)
        ? schema.views[view] : {};

    // create renderable elements based on schema
    // Filters out omitted fields (array) for view.
    // (Optional) load initial values from input data
    const fields =
        Object.keys(modelSchema)
            .filter(key =>
                !( modelSchema[key].hasOwnProperty('omit')
                    && modelSchema[key].omit.includes(view) )
            )
            .map(key => {
                const {value='', options=''} = data && data.hasOwnProperty(key)
                    ? data[key]
                    : {};

                return {
                    name: key,
                    label: modelSchema[key].label,
                    value: value || '',
                    options: options,
                    render: modelSchema[key].hasOwnProperty('render')
                        ? modelSchema[key].render
                        : 'text',
                    validate:modelSchema[key].hasOwnProperty('validate')
                        ? modelSchema[key].validate
                        : [],
                    refs: modelSchema[key].hasOwnProperty('refs')
                        ? modelSchema[key].refs
                        : []
                };
            });

    return {
        name: model,
        attributes: viewSchema,
        fields: fields
    }
}