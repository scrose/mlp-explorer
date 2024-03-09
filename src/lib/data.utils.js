/*!
 * MLP.API.Utilities.Data
 * File: data.utils.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import crypto from 'crypto';
import uid from 'uid-safe';

/**
 * Group array rows by common key
 * Reference: https://stackoverflow.com/a/38575908
 *
 * @param {Array} arr
 * @param {String} key
 * @src public
 */

export function groupBy(arr, key) {
    if (arr == null) return null;
    return arr.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
}

/**
 * Convert a `Map` to a standard
 * JS object recursively.
 *
 * @param {Map} map to convert.
 * @returns {Object} converted object.
 */

export const mapToObj = (map) => {
    const out = Object.create(null);
    map.forEach((value, key) => {
        if (value instanceof Map) {
            out[key] = mapToObj(value)
        }
        else {
            out[key] = value
        }
    })
    return out
}

/**
 * Sanitize data by PostGreSQL data type. Note for composite
 * user-defined types (i.e. coord, camera_settings, dims) the
 * data array is converted to a string representation of its tuple.
 * Empty strings are converted to NULL to trigger postgres non-empty
 * constraints.
 *
 * @param data
 * @param {String} datatype
 * @return {Object} cleanData
 * @src public
 */

export function sanitize(data, datatype) {
    const sanitizers = {
        'boolean': function() {
            return !!data;
        },
        'varying character': function() {
            // Replaces HTML tags with null string.
            return ((data===null) || (data===''))
                ? ''
                : data.toString().replace( /(<([^>]+)>)/ig, '');
        },
        'integer': function() {
            return isNaN(parseInt(data)) ? null : parseInt(data);
        },
        'double precision': function() {
            return isNaN(parseFloat(data)) ? null : parseFloat(data);
        },
        'float': function() {
            return isNaN(parseFloat(data)) ? null : parseFloat(data);
        },
        'json': function() {
            return JSON.stringify(data);
        },
        'USER-DEFINED': function() {
            return !Array.isArray(data) ? null : `(${data.join(',')})`;
        },
        'text': function() {
            // Replaces HTML tags with null string.
            return ((data===null) || (data===''))
                ? ''
                : data.toString().replace( /(<([^>]+)>)/ig, '');
        },
        'default': function() {
            return data === '' ? null : data;
        },
    };
    return (sanitizers[datatype] || sanitizers['default'])();
}


/**
 * Make snake/camel case strings readable.
 *
 * @param {String} str
 * @return {String} readable string
 * @src public
 */

export function humanize(str) {
    str = toSnake(str);
    let i, frags = str.split('_');
    for (i = 0; i < frags.length; i++) {
        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(' ');
}

/**
 * Make camelCase strings snake_case.
 *
 * @param {String} str
 * @return {String} snake_case string
 * @src public
 */

export const toSnake = (str) => {
    return str.replace(/[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Generate standard UUID.
 *
 * @public
 * @return {String} UUID
 */

export function genUUID() {
    return uid.sync(36);
}

/**
 * Generate Random ID (16 bytes)
 *
 * @public
 * @return {String} Random ID
 */

export function genID() {
    return crypto.randomBytes(16).toString('hex');
}