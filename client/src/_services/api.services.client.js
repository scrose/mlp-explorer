/*!
 * MLP.Client.Services.API
 * File: api.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */

import { getSessionToken } from './session.services.client';
import { redirect } from '../_utils/paths.utils.client';

/**
 * Get authorization header. Inserts JWT token into request headers.
 *
 * @public
 */

export function authHeader() {
    // default json content type
    const headers = {'Content-Type': 'application/json'}

    // get authentication token
    const token = getSessionToken();

    // include JWT token (if exists)
    if (token) headers['x-access-token'] = token;

    return headers;
}

/**
 * Fetch options for JSON API request.
 *
 * @public
 * @param {data, method, token}
 */

const getFetchOptions = ({ data=null, method='POST'}) => {
    const opts = {
            method: method, // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: authHeader(),
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
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
                statusText: res.statusText ? res.statusText : json.error || '',
                response: json
            }
        })
}

/**
 * Request wrapper to fetch data from API.
 *
 * @public
 * @param {String} url
 */

export async function getData(url='/') {
    return await makeRequest({url: url, method:'GET'})
        .then(res => {
            const { response } = res;
            // report API errors in console as warning
            if (!res.success) {
                console.warn(`An API error occurred (${res.statusText}): ${response.message.msg}.`);
                // Redirect for page not found
                if (res.status === 404) redirect('/not_found');
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
 */

export async function postData(url='/', data) {
    return await makeRequest({url: url, method:'POST', data: data})
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
