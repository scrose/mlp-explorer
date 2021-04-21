/*!
 * MLP.Client.Helpers.Paths
 * File: paths.helpers.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { getRoutes } from '../_services/schema.services.client';
import { schema } from '../schema';

/**
 * Root API/Client urls.
 *
 * @private
 */

const _API = {
    protocol: schema.app.protocol,
    host: schema.app.host,
    port: schema.app.apiPort
};
const _CLIENT = {
    protocol: schema.app.protocol,
    host: schema.app.host,
    port: schema.app.clientPort
};

/**
 * Get query value from path.
 *
 * @param {String} key
 * @public
 */

export function getQuery(key) {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    return params.get(key);
}

/**
 * Get root client url.
 *
 * @public
 */

export function getRoot() {
    return `${_CLIENT.protocol}${_CLIENT.host}:${_CLIENT.port}`;
}

/**
 * Create node route for requested model, view, id, group.
 * - format: <MODEL>/<VIEW>/<ID>/<GROUP>
 *
 * @public
 */

export function createNodeRoute(model='', view='', id='', group='') {
    const modelSlug = model ? `/${model}` : '';
    const viewSlug = view ? `/${view}` : '';
    const idSlug = id ? `/${id}` : '';
    const groupSlug = group ? `/${group}` : '';
    return `${modelSlug}${viewSlug}${idSlug}${groupSlug}`;
}

/**
 * Create API route for requested path and parameters.
 * - format: <URI>?<PARAMS>
 *
 * @param {String} path
 * @param {Object} params
 * @public
 */

export function createRoute(path='/', params) {
    const query = serialize((params || {}));
    return `${path}?${query}`;
}

/**
 * Build full API path for requests.
 *
 * @param route
 * @param params
 */

export function createURL(route, params={}) {
    const query = serialize((params || {}));
    const base = `${_API.protocol}${_API.host}:${_API.port}`;
    return `${base}${route}${params && Object.keys(params).length > 0 ? '?' + query : ''}`
}

/**
 * Serialize query object for url parameters.
 *
 * @public
 */

export function serialize(obj) {
    return Object.keys(obj)
        .map(p => {
            // handle array or string query
            let qStr = Array.isArray(obj[p])
                ? obj[p].join('_')
                : String(obj[p]).replace(/\s+/g, "_");

            // encode uri components for query string
            qStr = encodeURIComponent(qStr).replace(/_/g, '+')
            return encodeURIComponent(p) + "=" + qStr;
        })
        .join("&");
}

/**
 * Filter current client pathname using schema settings.
 *
 * @public
 */

export function filterPath() {

    // get current location path
    const path = window.location.pathname;
    const query = window.location.search;
    const uri = `${path}${query ? query : ''}`;

    // filter "nonviewable" static routes
    // - e.g. full nodes listing at '/nodes'
    // - filtered routes are defined in the schema
    const staticRoutes = getRoutes();
    const filteredURI = Object.keys(staticRoutes)
        .filter(key => path.match(`^${key}`) && staticRoutes[key].hasOwnProperty('redirect'))
        .reduce((o, key) => {
            return staticRoutes[key].redirect;
        }, '');

    return filteredURI ? filteredURI : uri;
}

/**
 * Redirect to uri in client.
 *
 * @param {String} uri
 * @public
 */

export function redirect(uri=null) {
    const route = uri ? uri : filterPath();
    return window.location.href = `${getRoot()}${route}`;
}

/**
 * Reroute to uri in client. (Does not refresh page).
 *
 * @param {String} uri
 * @public
 */

export function reroute(uri=null) {
    window.history.pushState(null, null, uri);
}
