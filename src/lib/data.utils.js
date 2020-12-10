/*!
 * MLP.API.Utilities.Data
 * File: /lib/data.utils.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Group JSON array rows by common key
 * Reference: https://stackoverflow.com/a/38575908
 *
 * @param {Object} xs
 * @param {String} key
 * @src public
 */

export function groupBy(xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

/**
 * Check if object is empty. NOTE: This should
 * work in ES5 compliant implementations.
 *
 * @param {Object} obj
 * @src public
 */

export function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

/**
 * Remove empty elements from array
 *
 * @param {Array} arr
 * @src public
 */

export function removeEmpty(arr) {
  // remove "Falsy" elements then null elements
  return array.filter(Boolean).filter(function (el) {
    return el != null;
  });
}

/**
 * Sanitize data by PostGreSQL data type.
 *
 * @param data
 * @param {String} datatype
 * @return {Object} cleanData
 * @src public
 */

export function sanitize (data, datatype) {
    const drinks = {
        'boolean': function () {
            return !!data;
        },
        'varying character': function () {
            return String(data);
        },
        'integer': function () {
            return isNaN(parseInt(data)) ? null : parseInt(data)
        },
        'double precision': function () {
            return isNaN(parseFloat(data)) ? null : parseFloat(data);
        },
        'float': function () {
            return isNaN(parseFloat(data)) ? null : parseFloat(data);
        },
        'default': function () {
            return data;
        }
    };
    return (drinks[datatype] || drinks['default'])();
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
    for (i=0; i<frags.length; i++) {
        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(' ');
}

/**
 * Make snake_case strings camelCase.
 *
 * @param {String} str
 * @return {String} camelCase string
 * @src public
 */

export const toCamel = (str) => {
        return str.replace(/([-_][a-z])/ig, ($1) => {
            return $1.toUpperCase()
                .replace('-', '')
                .replace('_', '');
        });
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
}