/*!
 * MLP.Client.Services.API
 * File: data.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */

import { getSessionToken } from './session.services.client';

/**
 * Get authorization header. Inserts JWT token into request headers.
 *
 * @param {String} ctype
 * @public
 */

export function authHeader(ctype='application/json') {
    // default json content type
    const headers = {'Content-Type': ctype}

    // get authentication token
    const token = getSessionToken();

    // include JWT token in headers (if exists)
    if (token) headers['x-access-token'] = token;

    return headers;
}

/**
 * Fetch options for JSON API request.
 * Options:
 * - method: *GET, POST only
 * - cors: no-cors, *cors, same-origin
 * - cache: *default, no-cache, reload, force-cache, only-if-cached
 * - credentials: include, *same-origin, omit
 * - headers: (see authHeader)
 * - redirect: manual, *follow, error
 * - referralPolicy:
 *      no-referrer, *no-referrer-when-downgrade, origin,
 *      origin-when-cross-origin, same-origin, strict-origin,
 *      strict-origin-when-cross-origin, unsafe-url
 *
 * @public
 * @params {data, method, ctype}
 */

const getFetchOptions = ({ data=null, method='POST', ctype='application/json'}) => {

    const opts = {
            method: method,
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: authHeader(ctype),
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        }

        // include form data in body for posts
        // body data type must match "Content-Type" header
        if (data) opts.body = JSON.stringify(data)

    return opts
}

/**
 * Make request to API.
 *
 * @public
 * @param {url, data, method, token}
 */

export async function makeRequest({ url='/', data=null, method='POST'})  {

    // compose request headers/options
    const opts = getFetchOptions({data, method});

    // send request to API
    return await fetch(url, opts)
            .then(handleResponse)
            .catch(err => {
                console.error('A fetch error has occurred:', err)
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
                statusText: res.statusText ? res.statusText : json.message || '',
                response: json
            }
        })
}