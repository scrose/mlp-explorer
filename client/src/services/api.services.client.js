/*!
 * MLP.Client.Services.API
 * File: api.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Fetch data from API.
 *
 * @public
 * @param {String} uri
 */

export async function fetchData(uri='/') {
        const res = await fetch(uri);

        if (!res.ok) {
            const message = `An error has occured: ${res.status}`;
            throw new Error(message);
        }
        return await res.json();
    }

/**
 * Send data to API.
 *
 * @public
 * @param {String} uri
 * @param {String} method
 * @param {Object} data
 */

export async function sendData(uri='/', method='POST', data={}) {
    const res = await fetch(uri,
        {
            method: method,
            body: data,
        });

    if (!res.ok) {
        const message = `An error has occured: ${res.status}`;
        throw new Error(message);
    }
    return await res.json();
}
