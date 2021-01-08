/*!
 * MLP.API.Utilities.API
 * File: api.utils.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Package JSON data for responses.
 *
 * @src public
 * @param model
 * @param view
 * @param attributes
 * @param message
 */

export function prepare(model, view, attributes={}, message=null) {
    return {
        attributes: attributes,
        model: model,
        view: view,
        message: null
    }
}