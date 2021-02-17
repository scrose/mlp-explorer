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
 * @params {data, files, method}
 */

const getFetchOptions = ({ data=null, files=null, method='POST'}) => {

    // set request options
    const opts = {
            method: method,
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        }

        // include form data in body for posts
        // body data type must match "Content-Type" header
        if (data) {
            // opts.header = { 'Content-Type' : 'application/json' };
            opts.body = JSON.stringify(data);
        }

    // omit content type from header for file(s) uploads
        if (files) {
            // opts.header = { 'Content-Type' : 'multipart/form-data' };
            opts.body = files;
        }

    return opts
}

/**
 * Make request to API.
 *
 * @public
 * @param {url, data, method, token}
 */

export async function makeRequest({
                                      url='/',
                                      data=null,
                                      files=null,
                                      method='POST',
})  {

    // compose request headers/options
    const opts = getFetchOptions({data, files, method});

    console.log(opts)

    // send request to API
    let res = await fetch(url, opts)
        .catch(err => { throw err });

    console.warn(res)

    // Modify response to include status ok, success, and status text
    return {
        success: res.ok,
        status: res.status,
        statusText: res.statusText,
        response: res.json()
    }
}