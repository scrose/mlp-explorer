/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Utilities.Data
  File:         /utilities/data.js
  ------------------------------------------------------
  Utility methods for handling data
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 9, 2020
  ======================================================
*/

'use strict';

// Group JSON array rows by common key
// REFERENCE: https://stackoverflow.com/a/38575908
exports.groupBy = function groupBy(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

// Check if object is empty
// NOTE: This should work in ES5 compliant implementations.
exports.isEmpty = function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}



