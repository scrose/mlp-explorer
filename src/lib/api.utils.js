/*!
 * MLP.API.Utilities.API
 * File: api.utils.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Package JSON data for HTTP response.
 *
 * @src public
 * @param model
 * @param view
 * @param attributes
 * @param message
 * @param user
 */

export function prepare({model='', view='', attributes={}, message={}, user={}}) {
    return {
        attributes: attributes,
        model: model,
        view: view,
        message: message,
        user: user
    }
}
