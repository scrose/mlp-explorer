/*!
 * MLP.API.Utilities.Data
 * File: /lib/data.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';
const date = require('./date');

// Group JSON array rows by common key
// REFERENCE: https://stackoverflow.com/a/38575908
exports.groupBy = function groupBy(xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

// Check if object is empty
// NOTE: This should work in ES5 compliant implementations.
exports.isEmpty = function isEmptyObject(obj) {
  return !Object.keys(obj).length;
};

// remove empty elements from array
exports.removeEmpty = function removeEmpty(array) {
  // remove "Falsy" elements then null elements
  return array.filter(Boolean).filter(function (el) {
    return el != null;
  });
};

// reformat data according to datatype in schema
exports.reformat = function reformat(data, schema) {
  data.forEach((item) => {
    for (const [key, field] of Object.entries(item)) {
      if (!field) continue;
      const dataType = schema.fields.hasOwnProperty(key) ? schema.fields[key].type : null;
      switch (dataType) {
        case 'timestamp':
          //"yyyy-MM-dd hh:mm:ss"
          item[key] = date.convert(field).toLocaleString();
          break;
      }
    }
  });
  return data;
};

// sanitize user data
exports.sanitize = function sanitize(data) {
  return data;
};
