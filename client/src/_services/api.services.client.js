/*!
 * MLP.Client.Services.API
 * File: data.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */

import { createURL } from '../_utils/paths.utils.client';

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

const getFetchOptions = ({ data=null, files=null, download=null, method='POST'}) => {

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
            opts.headers = {'Content-Type': 'application/json'};
            opts.body = JSON.stringify(data);
        }

        // omit _static type from header for file(s) uploads
        if (files) {
            // opts.header = { 'Content-Type' : 'multipart/form-data' };
            opts.body = files;
        }

        // for file downloads, modify header to accept requested file format
        if (download) {
            opts.headers = { Accept: getMIME(download) };
            console.log(opts)
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
                                      download=null
})  {

    // compose request headers/options
    const opts = getFetchOptions({data, files, method, download});

    // send request to API
    let res = await fetch(url, opts).catch(console.error);

    if (!res) return null;

    // Modify response to include status ok, success, and status text
    return {
        success: res.ok,
        status: res.status,
        statusText: res.statusText,
        response: files
            ? null
            : download
                ? await res.blob()
                : await res.json()
    }
}


/**
 * Request method to upload file(s) via API.
 *
 * @public
 * @param {String} route
 * @param formData
 * @param callback
 * @param online
 */

export const upload = async (route, formData, callback=()=>{}, online=true) => {

    // reject null paths or when API is offline
    if (!route || !online ) return null;

    // DEBUG: Display the key/value pairs of form data
    // for(var pair of formData.entries()) {
    //     console.log(pair[0]+ ', '+ pair[1]);
    // }

    try {

        let xhr = new XMLHttpRequest();
        xhr.open('POST', createURL(route), true);
        xhr.withCredentials = true;
        xhr.responseType = 'json';

        // request finished event
        xhr.onload = function(e) {
            if (xhr.readyState === 4) {
                const {statusText='An API Error Occurred.'} = e.currentTarget || {};
                const { response={} } = e.currentTarget || {};
                const { message={} } = response || {};
                const {msg=statusText} = message || {};

                // success
                if (xhr.status === 200) {
                    return callback(null, {msg: msg, type: 'success'}, response);
                }
                // error
                else {
                    return callback(null, {msg: msg, type: 'error'});
                }
            }
        };

        // error in sending network request
        xhr.onerror = function(e) {
            const {statusText='API Error Occurred.'} = e.currentTarget || {};
            return callback(null, {msg: statusText, type: 'error'});
        };

        // Upload progress callback
        xhr.upload.onprogress = function(e) {
            return callback(e);
        };

        // Upload error callback
        xhr.upload.onerror = function() {
            return callback(null, {msg: 'Upload error has occurred.', type: 'error'});
        };

        // Upload timeout callback
        xhr.upload.ontimeout = function() {
            return callback(null, {msg: 'Upload has timed out.', type: 'error'});
        };

        // Upload abort callback
        xhr.upload.onabort = function() {
            return callback(null, {msg: 'Upload was aborted.', type: 'warn'});
        };

        // Upload end callback
        xhr.upload.onloadend = function() {
            return callback(null, {msg: 'Upload completed!', type: 'success'});
        };

        // send POST request to server
        xhr.send(formData);

    } catch (err) {
        return callback(null, {msg: 'Submission Failed. Please try again.', type: 'error'});
    }
};

/**
 * Request method to download file.
 *
 * @public
 * @param {String} route
 * @param {String} format
 * @param online
 */

export const download = async (route, format, online=true) => {

    // reject null paths or when API is offline
    if (!route || !online ) return null;

    return await makeRequest({url: createURL(route), method:'GET', download: format})
        .then(res => {
            console.log('Response:', res)
            if (!res) return null;
            const {error=null} = res || {};
            return {
                error: error,
                data: new Blob([res.response])
            }

        })
        .catch(console.error);
}

/**
 * Lookup allowed mimetype from file extension.
 *
 * @src public
 * @param filename
 * @return {String} mimetype
 */

export function getMIME(filename) {
    const ext = filename.split('.').pop() || '';
    const mime_types = {
        "csv": 'text/csv',
        "json": 'text/json',
        "xml": 'text/xml',
        'pdf': 'application/pdf',
        'bm': 'image/bmp',
        'bmp': 'image/bmp',
        'gif': 'image/gif',
        'jpe': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'tif': 'image/tiff',
        'tiff': 'image/tiff',
        'ARW': 'image/x-sony-arw',
        'CR2': 'image/x-canon-cr2',
        'CRW': 'image/x-canon-crw',
        'DCR': 'image/x-kodak-dcr',
        'DNG': 'image/x-adobe-dng',
        'ERF': 'image/x-epson-erf',
        'K25': 'image/x-kodak-k25',
        'KDC': 'image/x-kodak-kdc',
        'MRW': 'image/x-minolta-mrw',
        'NEF': 'image/x-nikon-nef',
        'ORF': 'image/x-olympus-orf',
        'PEF': 'image/x-pentax-pef',
        'RAF': 'image/x-fuji-raf',
        'RAW': 'image/x-panasonic-raw',
        'SR2': 'image/x-sony-sr2',
        'SRF': 'image/x-sony-srf',
        'X3F': 'image/x-sigma-x3f',
    };
    return mime_types.hasOwnProperty(ext) ? mime_types[ext] : null;
}