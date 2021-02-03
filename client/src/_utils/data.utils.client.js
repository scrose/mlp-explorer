/*!
 * MLP.Client.Helpers.Data
 * File: data.utils.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Capitalize first letter of string.
 *
 * @param {String} str
 * @return {String} capitalized string
 * @public
 */

export const capitalize = (str) => {
    if (typeof str !== 'string') return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Extract username from email address.
 *
 * @param {String} email
 * @return {String} capitalized string
 * @public
 */

export const getEmailUser = (email) => {
    if (typeof email !== 'string') return ''
    return email.replace(/@.*$/,"")
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
 * Render datum by render settings.
 *
 * @public
 * @return input element
 * @param value
 * @param render
 * @param href
 * @param title
 */

export const sanitize = (value, render='', href='', title='') => {
    const _dataElements = {
        date: ({ value }) => {
            const date = new Date(value);
            const month = date.toLocaleString('default', { month: 'long' });
            return `${month} ${date.getDate()}, ${date.getFullYear()}`;
        },
        timestamp: ({ value }) => {
            const date = new Date(value);
            return `${date.toLocaleString()}`;
        },
        text: ({ value }) => {
            return value != null ? String(value) : '-';
        },
        default: ({ value }) => {
            return value != null ? String(value) : '-';
        }
    }

    // render data component
    return render && _dataElements.hasOwnProperty(render)
        ? _dataElements[render]({ value, href, title })
        : _dataElements.default({ value });
}

/**
 * Get root node from node path. Indexed by '0'.
 *
 * @public
 * @return {Object} node
 * @param {Object} path
 */

export const getRootNode = (path=null) => {
    return Object.keys(path || {})
        .filter(key => key === '0')
        .reduce((o, key) => {
            return path[key];
        }, {});
}
