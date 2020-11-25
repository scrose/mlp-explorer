/*!
 * MLP.API.Classes.Error
 * File: /classes/Error.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Define Error messages for lookup.
 *
 * @private
 */

let errorMessages = {
  23514: 'Email and/or password are empty or invalid.',
  '42P01': 'Database is misconfigured. Contact the site administrator for assistance.',
  login: 'Authentication failed. Please check your login credentials.',
  loginFailure: 'Authentication failed. Please check your login credentials.',
  logoutFailure: 'Logging out failed. You are no longer signed in.',
  logoutRedundant: 'User is not signed in.',
  session: 'Session error. Contact the site administrator for assistance.',
  default: 'An error occurred. Your request could not be completed. Contact the site administrator for assistance.',
  restrict: 'Access denied!',
};

/**
 * Module exports.
 * @public
 */

export default LocalError;

/**
 * Create local (custom) Error data model.
 *
 * @public
 * @param message
 * @param fileName
 * @param lineNumber
 */

function LocalError(message, fileName = null, lineNumber = null) {
  let instance;
  instance = new Error(message);
  instance.name = 'LocalError';
  instance.decoded = errorMessages.hasOwnProperty(message) ? errorMessages[message] : errorMessages.default;
  // Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, LocalError);
  }
  return instance;
}

/**
 * Inherit methods from Error class.
 */

LocalError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true,
  },
});

/**
 * Inherit methods from Model abstract class.
 */

if (Object.setPrototypeOf) {
  Object.setPrototypeOf(LocalError, Error);
} else {
  LocalError.__proto__ = Error;
}
