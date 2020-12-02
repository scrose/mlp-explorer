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
 * Sanitize user input data.
 * TODO: Currently sanitize is not implemented.
 *
 * @param {Object} data
 * @return {Object} cleanData
 * @src public
 */

export function sanitize(data) {
    let cleanData = data + '';
    return cleanData;
}

/**
 * Make _underscore_ strings readable.
 *
 * @param {String} str
 * @return {String} readable string
 * @src public
 */

export function humanize(str) {
    let i, frags = str.split('_');
    for (i=0; i<frags.length; i++) {
        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(' ');
}
