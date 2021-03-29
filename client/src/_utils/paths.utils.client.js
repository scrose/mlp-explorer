/*!
 * MLP.Client.Helpers.Paths
 * File: paths.helpers.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */

import { getRoutes } from '../_services/schema.services.client';

/**
 * Root API/Client urls.
 *
 * @private
 */

const _API = 'http://localhost:3001';
const _CLIENT = 'http://localhost:3000';

/**
 * Get full client URL from path.
 *
 * @public
 */

export function getURL() {
    return `${_CLIENT}${filterPath()}`;
}

/**
 * Filter current client pathname using
 * schema settings.
 *
 * @public
 */

export function filterPath() {

    // get current location path
    const uri = window.location.pathname;

    // filter "nonviewable" static routes
    // - e.g. full nodes listing at '/nodes'
    // - filtered routes are defined in the schema
    const staticRoutes = getRoutes();
    const filteredURI = Object.keys(staticRoutes)
        .filter(key => uri.match(`^${key}`) && staticRoutes[key].hasOwnProperty('redirect'))
        .reduce((o, key) => {
            return staticRoutes[key].redirect;
        }, '');

    return filteredURI ? filteredURI : uri;
}

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
    return _CLIENT;
}

/**
 * Get current client URL.
 *
 * @param {String} uri
 * @public
 */

export function getAPIURL(uri=null) {
    const route = uri ? uri : filterPath();
    return `${_API}${route}`
}

/**
 * Redirect to uri in client.
 *
 * @param {String} uri
 * @public
 */

export function redirect(uri=null) {
    const route = uri ? uri : filterPath();
    return window.location.href = `${_CLIENT}${route}`;
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

/**
 * Create node path for requested model, view, id.
 *
 * @public
 */

export function getNodeURI(model, view='', id='') {
    const modelSlug = model ? `/${model}` : '';
    const viewSlug = view ? `/${view}` : '';
    const idSlug = id ? `/${id}` : '';
    return `${modelSlug}${viewSlug}${idSlug}`;
}

/**
 * Serialize query object.
 *
 * @public
 */

export function serialize(obj) {
    let str = [];
    for (let p in obj)
        if (obj.hasOwnProperty(p)) {
            let qStr = obj[p].replaceAll(' ', '+');
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(qStr));
        }
    return str.join("&");
}
