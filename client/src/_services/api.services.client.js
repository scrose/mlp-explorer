/*!
 * MLP.Client.Services.API
 * File: data.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */

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
 * @params {data, method, ctype, token}
 */

const getFetchOptions = ({ data=null, method='POST', ctype='application/json', token=null}) => {

    const opts = {
            method: method,
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
                'Content-Type': ctype
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        }

        // include form data in body for posts
        // body data type must match "Content-Type" header
        if (data) opts.body = JSON.stringify(data);

    return opts
}

/**
 * Make request to API.
 *
 * @public
 * @param {url, data, method, token}
 */

export async function makeRequest({ url='/', data=null, files=null, method='POST', token=null})  {

    // select content type
    const ctype = files ? 'application/json' : 'application/json';

    // select payload type
    const payload = files ? files : data;

    // compose request headers/options
    const opts = getFetchOptions({payload, method, token, ctype});

    // send request to API
    let res = await fetch(url, opts)
        .catch(err => { throw err });

    // Modify response to include status ok, success, and status text
    return {
        success: res.ok,
        status: res.status,
        statusText: res.statusText,
        response: res.json()
    }
}