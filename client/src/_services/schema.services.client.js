/*!
 * MLP.Client.Services.Schema
 * File: schema.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { schema } from '../schema';
import { sanitize } from '../_utils/data.utils.client';

/**
 * Get static view render index from given route. Unlike data
 * views, static views do not require input data from API requests.
 *
 * @public
 * @param {String} route
 * @return {String} static view type
 */

export const getStaticView = (route) => {
    const routeData = getStaticRoute(route);
    return routeData.hasOwnProperty('name') ? routeData.name : null;
}

/**
 * Get route data from schema.
 *
 * @public
 * @param {String} route
 * @return {String} static route
 */

export const getStaticRoute = (route) => {
    const routes = getRoutes();
    return routes.hasOwnProperty(route) ? routes[route] : {};
}

/**
 * Get route data from schema.
 *
 * @public
 * @return {String} static route
 */

export const getRoutes = () => {
    const { routes={} } = schema || {};
    return routes;
}

/**
 * Get label for static view.
 *
 * @public
 * @param {String} route
 * @return {String} static view label
 */

export const getStaticLabel = (route) => {
    const { routes={} } = schema || {};
    return routes.hasOwnProperty(route) ? routes[route].label : '';
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

export const getAppTitle = () => {
    return `${schema.app.name}`;
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
    const { render=view } = _getViewAttributes(view, model);
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
 * Generate lookup table for field key(s) used to assign labels for nodes.
 * - Selects only fields assigned as label keys.
 * - Keys are sorted by the order value assigned to 'key' in the field.
 * - Returns model-index arrays of field settings for each key.
 *
 * @public
 */

const labelKeys = Object.keys(schema.models)
        .reduce((o, model) => {
            // select keys from fields
            o[model] = Object.keys(schema.models[model])
                .filter(field => schema.models[model][field].key || field === 'attributes')
                .reduce((o, field) => {
                    // index field labels by position
                    o[field] = schema.models[model][field];
                    return o;
                }, {});
            return o;
        }, {});

/**
 * Retrieve field key(s) used to assign labels for model nodes.
 *
 * @public
 */

export const getLabelKeys = (model) => {
    return labelKeys.hasOwnProperty(model) ? labelKeys[model] : {};
}

/**
 * Retrieve label for model from schema.
 *
 * @param {String} model
 * @param {String} type
 * @return {String} label
 * @public
 */

export const getModelLabel = (model, type='singular') => {
    if (labelKeys.hasOwnProperty(model)) {
        const { attributes = {} } = labelKeys[model] || {};
        return attributes.hasOwnProperty(type)
            ? labelKeys[model].attributes[type]
            : '';
    }
    return '';
}

/**
 * Retrieve label for model from schema.
 *
 * @param {String} model
 * @return {String} dependents
 * @public
 */

export const getDependents = (model) => {
    return schema.models.hasOwnProperty(model)
        ? schema.models[model].attributes.hasOwnProperty('dependents')
            ? schema.models[model].attributes.dependents
            : ''
        : '';
}

/**
 * Computes label for given node data using data fields.
 * - looks up fields assigned as key(s) to label node type instance
 * - sorts key values (integers) to order positions in the label
 * - joins field values with commas to compose label
 *
 * @public
 * @param {Object} node
 * @return {String} label
 */

export const getNodeLabel = (node) => {

    // get label keys for node type from schema
    const {type='', data={}} = node || {};
    const lkeys = getLabelKeys(type) || [];

    // get default label
    const { attributes={singular: ''} } = lkeys || {};

    // iterate over label keys assigned in schema
    const label = Object.keys(lkeys)
        .filter(field => data.hasOwnProperty(field) && data[field])
        .sort(function(fieldA,fieldB) {
            return lkeys[fieldA].key - lkeys[fieldB].key;
        })
        .map(field => {
            return sanitize(
                data[field],
                lkeys[field].hasOwnProperty('render')
                    ? lkeys[field].render
                    : ''
            )
        })
        .join(', ');

    // Handle empty labels
    return label ? label : attributes.singular;
}

/**
 * Get order of node in tree.
 *
 * @public
 * @param {Object} node
 * @return {Object} message
 */

export const getNodeOrder = (node) => {
    const {type=''} = node;
    const modelSchema = schema.models.hasOwnProperty(type)
        ? schema.models[type] : '';
    const { attributes={} } = modelSchema || {};

    return attributes.hasOwnProperty('order') ? attributes.order : 0;
}

/**
 * Load view settings for model.
 *
 * @public
 * @param {String} view
 * @param {String} model
 * @param {Object} modelAttributes
 * @return {{model: String, attributes: *, fields: {name: *, label: *, render: *|string, value: *|string}[]}}
 */

export const genSchema = (view, model, modelAttributes={}) => {

    const modelSchema = schema.models.hasOwnProperty(model)
        ? schema.models[model]
        : {};
    const viewAttributes = _getViewAttributes(view, model);

    // include any default (common) fields to model schema
    // - for example, ID fields (e.g. nodes_id) and timestamps
    //   (e.g. 'created_at' is common to all nodes).

    Object.keys(modelAttributes)
        .filter(key => schema.models.default.hasOwnProperty(key))
        .reduce((o, key) => {
            o[key] = schema.models.default[key];
            return o;
        }, modelSchema)

    /** create renderable elements based on schema
        Filters out omitted fields (array) for view.
        - set in schema 'restrict' settings (list of
          views restricted for showing the field).
        - when 'restrict' is absent, all views show
          the field.
        - an empty 'restrict' array omits the field
          from all views.
        (Optional) load initial values from input data
     */

    const fields =
        Object.keys(modelSchema)
            .filter(key =>
                key !== 'attributes'
                &&
                (
                    !modelSchema[key].hasOwnProperty('restrict')
                    || modelSchema[key].restrict.includes(view)
                )
            )
            .map(key => {
                const {value='', options=[], label=''} = modelAttributes && modelAttributes.hasOwnProperty(key)
                    ? modelAttributes[key]
                    : {};

                return {
                    name: key,
                    label: modelSchema[key].label || label,
                    value: value,
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
            }).reduce((o, field) => {
                o[field.name] = field;
                return o;
            }, {});

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