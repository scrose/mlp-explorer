/*!
 * MLP.Client.Utilities.Router
 * File: router.utilities.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

const _API = 'http://localhost:3001';

/**
 * Get current client URL.
 *
 * @private
 * @param {String} uri
 * @return {String} url
 */

export function getRoute(uri=null) {
    const route = uri ? uri : window.location.pathname;
    return `${_API}${route}`
}
