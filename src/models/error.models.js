/*!
 * MLP.API.Classes.Error
 * File: /classes/error.js
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
    logoutRedundant: 'UserModel is not signed in.',
    session: 'Session error. Contact the site administrator for assistance.',
    default: 'An error occurred. Your request could not be completed. Contact the site administrator for assistance.',
    notfound: 'Page could not be found.',
    restrict: 'Access denied!',
};

/**
 * Module exports.
 * @public
 */

export default ControlError;

/**
 * Create local (custom) Error data model.
 *
 * @public
 * @param message
 * @param fileName
 * @param lineNumber
 */

function ControlError(message, fileName = null, lineNumber = null) {
    let instance = new Error(message);
    instance.name = 'ControlError';
    instance.decoded = errorMessages.hasOwnProperty(message) ? errorMessages[message] : errorMessages.default;
    // Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, ControlError);
    }
    return instance;
}

/**
 * Inherit methods from Error class.
 */

ControlError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true,
    },
});
