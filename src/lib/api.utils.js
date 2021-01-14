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
 * @param {Object} model
 * @param view
 * @param message
 * @param user
 * @param data
 * @param filter
 */

export function prepare({
                            model={},
                            view='',
                            message={},
                            user=null,
                            data=null,
                            filter = []
}) {

    // get model attributes
    const {name={}, attributes={}} = model;

    // get submission data
    const submissionData = data
        ? data
        : Object.keys(model).length > 0 ? model.getData(filter) : {};

    return {
        model: {
            name: name,
            attributes: attributes
        },
        view: view,
        message: message,
        data: submissionData,
        user: user
    }
}
