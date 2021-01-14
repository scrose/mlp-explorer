/*!
 * MLP.Client.Services.API
 * File: api.services.client.js
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

export function getURL(path) {
    return `${_CLIENT}${path}`;
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
 * Get current client pathname.
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
 * Get authorization header. Inserts JWT token into request headers.
 *
 * @param {Object} token
 * @public
 */

export function authHeader(token='') {
    // default json content type
    const headers = {'Content-Type': 'application/json'}

    console.log('Header x-access token:', typeof token)

    // include JWT token (if exists)
    if (token) headers['x-access-token'] = token;

    console.log('HEaders:', headers)

    return headers;
}

/**
 * Fetch options for JSON API request.
 *
 * @public
 * @param {data, method, token}
 * @param token
 */

const getFetchOptions = ({ data=null, method='POST', token=null }) => {
    const opts = {
            method: method, // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: authHeader(token),
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        }

        // include form data in body for posts
        // body data type must match "Content-Type" header
        if (data) opts.body = JSON.stringify(data)

        console.log('Options:', opts)
    return opts
}

/**
 * Make request to API.
 *
 * @public
 * @param {url, data, method, token}
 */

export async function makeRequest({ url='/', data=null, method='POST', token=null })  {

    // compose request headers/options
    const opts = getFetchOptions({data, method, token});

    // send request to API
    return await fetch(url, opts)
            .then(handleResponse)
            .catch(err => {
                console.error('An API error occurred:', err)
            })
}

/**
 * Handle response to API request.
 *
 * @public
 * @param {Object} res
 */

function handleResponse(res) {
    return res.json()
        .then(json => {
            // Modify response to include status ok, success, and status text
            return {
                success: res.ok,
                status: res.status,
                statusText: res.statusText ? res.statusText : json.error || '',
                response: json
            }
        })
}

/**
 * Request wrapper to authenticate user token from API.
 *
 * @public
 * @param {String} token
 */

export async function auth(token='') {

    console.log('Auth:', typeof token)

    return await makeRequest({ url: '/auth', method: 'POST', token: token })
        .then(res => {
            const { response } = res;
            // report API errors in console as warning
            if (!res.success)
                console.warn(`An API error occurred (${res.statusText}): ${response.message.msg}.`);
            return response;
        })
        .catch(err => {
            console.error('An API error occurred:', err)
        });
}

/**
 * Request wrapper to fetch data from API.
 *
 * @public
 * @param {String} url
 * @param {String} token
 */

export async function getData(url='/', token='') {
    return await makeRequest({url: url, method:'GET', token: token})
        .then(res => {
            const { response } = res;
            // report API errors in console as warning
            if (!res.success) {
                console.warn(`An API error occurred (${res.statusText}): ${response.message.msg}.`);
            }
            return response;
        })
        .catch(err => {
            console.error('An API error occurred:', err)
        });
}

/**
 * Request wrapper to post data from API.
 *
 * @public
 * @param {String} url
 * @param {Object} data
 * @param token
 */

export async function postData(url='/', data, token='') {
    return await makeRequest({url: url, method:'POST', data: data, token: token})
        .then(res => {
            const { response } = res;
            // report API errors in console as warning
            if (!res.success)
                console.warn(`An API error occurred (${res.statusText}): ${response.message.msg}`);
            return response;
        })
        .catch(err => {
            console.error('An API error occurred:', err)
        });
}
