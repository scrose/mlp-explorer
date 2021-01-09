/*!
 * MLP.Client.Services.API
 * File: api.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */

/**
 * Fetch options for JSON API request.
 *
 * @public
 * @param {Object} data
 * @param {String} method
 */

const getFetchOptions = (data=null, method) => {
    const opts = {
            method: method, // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'multipart/form-data'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
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
 * @param {String} url
 * @param {String} method
 * @param {Object} data
 */

export async function makeRequest(url='/', method='POST', data=null)  {

    const opts = getFetchOptions(data, method);

    console.log(opts)

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
 * Request wrapper to fetch data from API.
 *
 * @public
 * @param {String} url
 */

export async function getData(url='/') {
    return await makeRequest(url, 'GET')
        .then(res => {
            return res;
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

    // show outgoing data
    console.log(data)

    return await makeRequest(url, 'POST', data)
        .then(res => {
            // report API errors in console as warning
            if (!res.success)
                console.warn(`An API error occurred (${res.statusText}): ${res.response.msg}.`);
            return res;
        })
        .catch(err => {
            console.error('An API error occurred:', err)
        });
}