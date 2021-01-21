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
 * Returns render code for view/model. Model and view labels
 * must be unique.
 *
 * @public
 * @param {String} view
 * @param {String} model
 * @return {String} view type
 */

export const getRenderType = (view, model) => {

    // destructure the render property from the schema
    const { render=null } = _getViewAttributes(view, model);

    return render;
}

/**
 * Get field settings from schema.
 *
 * @public
 * @param {String} key
 * @param {String} type
 * @return {Object} message
 */

export const getField = (key='', type='common') => {
    const modelSchema = schema.models.hasOwnProperty(type)
        ? schema.models[type] : '';
    return modelSchema
        ? modelSchema.hasOwnProperty(key)
            ? modelSchema[key] : '' : '';
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
 * @return {{model: String, attributes: *, fields: {name: *, label: *, render: *|string, value: *|string}[]}}
 */

export const genSchema = (view, model, data=null) => {

    const modelSchema = schema.models.hasOwnProperty(model)
        ? schema.models[model]
        : {};
    const viewAttributes = _getViewAttributes(view, model);

    // include common fields



    // create renderable elements based on schema
    // Filters out omitted fields (array) for view.
    // - set in schema 'restrict' settings (list of
    //   views restricted for showing the field).
    // - when 'restrict' is absent, all views show
    //   the field.
    // - an empty 'restrict' array omits the field
    //   from all views.
    // (Optional) load initial values from input data

    const fields =
        Object.keys(modelSchema)
            .filter(key =>
                !modelSchema[key].hasOwnProperty('restrict')
                ||
                (
                    modelSchema[key].hasOwnProperty('restrict')
                    && modelSchema[key].restrict.includes(view)
                )
                // ||
                // (
                //     schema.models.common[key].hasOwnProperty('restrict')
                //     && schema.models.common[key].restrict.includes(view)
                // )
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

    console.log('schema fields:', fields)

    return {
        model: model,
        view: view,
        attributes: viewAttributes,
        fields: fields
    }
}

/**
 * Returns schema attributes for view/model. Model and view labels
 * must be unique.
 *
 * @public
 * @param {String} view
 * @param {String} model
 * @return {Object} view attributes
 */

const _getViewAttributes = (view, model) => {

    // check if model has specified view
    const modelView = schema.views.hasOwnProperty(model)
        ? schema.views[model].hasOwnProperty(view)
            ? schema.views[model][view]
            : null
        : null;

    // Otherwise use default view
    const defaultView = schema.views.hasOwnProperty(view)
        ? schema.views[view]
        : null;

    return modelView || defaultView || {}
}