/*!
 * MLP.Core.Utilities.Object
 * File: /models/Base.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Get properties and methods of an object.
 *
 * @private
 * @param {Object} obj
 */

exports.getProperties = function (obj) {
  return Object.getOwnPropertyNames(obj).filter((item) => typeof obj[item] === 'function');
};

/**
 * Helper function for creating a method on a prototype.
 *
 * @param {Object} obj
 * @param {String} name
 * @param {Function} fn
 * @private
 */

exports.defineMethod = function (obj, name, fn) {
  Object.defineProperty(obj.prototype, name, {
    configurable: true,
    enumerable: false,
    value: fn,
    writable: true,
  });
};
