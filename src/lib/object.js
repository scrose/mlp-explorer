/*!
 * MLP.API.Utilities.Object
 * File: /models/composer.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Get properties and methods of an object.
 *
 * @private
 * @param {Object} obj
 */

export function getProperties(obj) {
  return Object.getOwnPropertyNames(obj).filter((item) => typeof obj[item] === 'function');
}

/**
 * Helper function for adding methods to object constructors:
 *
 * @param {Object} obj
 * @param {String} name
 * @param {function(*): *} fn
 * @private
 */

export function defineMethod(obj, name, fn) {
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: false,
    value: fn,
    writable: true,
  });
}
