/*!
 * MLP.Client.Helpers.Paths
 * File: paths.helpers.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */

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
 * @param {String} path
 * @public
 */

export function getURL() {
    return `${_CLIENT}${getPath()}`;
}

/**
 * Get current client pathname.
 *
 * @public
 */

export function getPath() {
    return window.location.pathname;
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

export function getRoute(uri=null) {
    const route = uri ? uri : getPath();
    return `${_API}${route}`
}

/**
 * Redirect to uri in client.
 *
 * @param {String} uri
 * @public
 */

export function redirect(uri=null) {
    const route = uri ? uri : getPath();
    return window.location.href = `${_CLIENT}${route}`;
}