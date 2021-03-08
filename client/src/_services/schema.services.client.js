/*!
 * MLP.Client.Services.Schema
 * File: schema.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { schema } from '../schema';
import { capitalize, sanitize } from '../_utils/data.utils.client';

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
 * Generate lookup table for field key(s) used to assign labels for nodes.
 * - Selects only fields assigned as label keys.
 * - Keys are sorted by the order value assigned to 'key' in the field.
 * - Returns model-index arrays of field settings for each key.
 *
 * @public
 */

const labelKeys = Object.keys(schema.models)
        .reduce((o, model) => {
            // select assigned label keys from fields in model fieldsets
            o[model] = schema.models[model].fieldsets
                .reduce((fset, fieldset) => {
                        Object.keys(fieldset)
                        .filter(field => fieldset[field].key && field !== 'legend' && field !== 'render')
                        .map(field => {
                            fset[field] = fieldset[field];
                            return fset;
                        })
                    return fset;
                }, {})

            // include general attributes
            o[model].attributes = schema.models[model].attributes;
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
 * @param {String} view
 * @return {String} label
 * @public
 */

export const getViewLabel = (view) => {
    if (schema.views.hasOwnProperty(view)) {
        const { label = capitalize(view) } = schema.views[view] || {};
        return label;
    }
    return '';
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
    if (schema.models.hasOwnProperty(model)) {
        const { attributes = {} } = schema.models[model] || {};
        return attributes.hasOwnProperty(type)
            ? schema.models[model].attributes[type]
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
    const { type='', data={} } = node || {};
    const labelKeys = getLabelKeys(type) || [];

    // get default label
    const { attributes={singular: '', key: ''} } = labelKeys || {};

    // iterate over label keys assigned in schema
    const label = Object.keys(labelKeys)
        .filter(labelKey => data.hasOwnProperty(labelKey) && data[labelKey])
        .sort(function(labelKeyA,labelKeyB) {
            return labelKeys[labelKeyA].key - labelKeys[labelKeyB].key;
        })
        .map(field => {
            return sanitize(
                data[field],
                labelKeys[field].hasOwnProperty('render')
                    ? labelKeys[field].render
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
 * Computes label for given file data using schema data fields.
 * - extracts prefix from filename to use as a label.
 *
 * @public
 * @param {Object} file
 * @return {String} label
 */

export const getFileLabel = (file) => {

    // get label keys for node type from schema
    const {label='', filename='', file_type='', file_size='', data={}} = file || {};

    // get image label
    const getImgLabel = () => {

        // extract prefix substring from filename to omit key token string
        // - looks for last underscore '_' in filename as index
        // - OR looks for last dot '.' in filename as index
        const lastIndex = filename.lastIndexOf('_') > 0
            ? filename.lastIndexOf('_')
            : filename.lastIndexOf('.');
        const abbrevFilename = filename.substring(0, lastIndex);

        // Handle empty file labels
        return abbrevFilename ? abbrevFilename : getNodeLabel(file_type);
    }

    // get metadata file label
    const getMetadataLabel = () => {
        return `${filename} (${capitalize(data.type)} Metadata) ${file_size ? `[${file_size}]` : ''}`;
    }

    // label functions indexed by file type
    const fileTypes = {
        historic_images: () => {return label ? label : getImgLabel();},
        modern_images: () => {return label ? label : getImgLabel();},
        supplemental_images: () => {return getImgLabel();},
        metadata_files: () => {return getMetadataLabel();},
    }

    return fileTypes.hasOwnProperty(file_type) ? fileTypes[file_type]() : null
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

    // check that model schema has fieldsets
    if (!modelSchema.hasOwnProperty('fieldsets'))
        return {};

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

    const filteredFieldsets =
        modelSchema.fieldsets
            .filter(fieldset =>
                (
                    !fieldset.hasOwnProperty('restrict')
                    || fieldset.restrict.includes(view)
                )
            )
            .map((fieldset, index) => {

                const { render='', restrict='', legend=''} = fieldset || {};

                // filter fields
                let filteredFields = Object.keys(fieldset)
                    .filter(fieldKey =>
                        fieldKey !== 'legend'
                        && fieldKey !== 'render'
                        && fieldKey !== 'restrict'
                        &&
                        (
                            !fieldset[fieldKey].hasOwnProperty('restrict')
                            || fieldset[fieldKey].restrict.includes(view)
                        )
                    )
                    .map(fieldKey => {

                        // get optional model attributes from API data
                        const {value='', options=[], label=''} = modelAttributes && modelAttributes.hasOwnProperty(fieldKey)
                            ? modelAttributes[fieldKey]
                            : {};

                        return {
                            name: render === 'multiple' ? `${fieldKey}[${index}]` : fieldKey,
                            id: fieldKey,
                            label: fieldset[fieldKey].label || label,
                            value: value,
                            options: options,
                            render: fieldset[fieldKey].hasOwnProperty('render')
                                ? fieldset[fieldKey].render
                                : 'text',
                            validate:fieldset[fieldKey].hasOwnProperty('validate')
                                ? fieldset[fieldKey].validate
                                : [],
                            refs: fieldset[fieldKey].hasOwnProperty('refs')
                                ? fieldset[fieldKey].refs
                                : []
                        };
                    })
                    .reduce((o, field) => {
                        o[field.name] = field;
                        return o;
                    }, {});
                return {
                    legend: legend,
                    render: render,
                    fields: filteredFields
                }
            });

    return {
        model: model,
        view: view,
        attributes: viewAttributes,
        fieldsets: filteredFieldsets
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

    return modelView ? modelView : defaultView ? defaultView : {};
}