
/*!
 * MLP.Core.Classes.Error
 * File: /classes/error.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Validation errors
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @api private
 */
class ValidationError extends Error {
    messages = {
        '23514': 'Email and/or password are empty or invalid.',
        '42P01': 'Database is misconfigured. Contact the site administrator for assistance.',
        login: 'Authentication failed. Please check your login credentials.',
        logout: 'Logging out failed. Contact the site administrator for assistance.',
        session: 'Session error. Contact the site administrator for assistance.',
        default: 'An error occurred. Your request could not be completed. Contact the site administrator for assistance.',
        restrict: 'Access denied!'
    };
    constructor(code='default', ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params)

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError)
        }

        this.name = 'ValidationError';
        this.code = code;
        this.message = (this.messages.hasOwnProperty(code)) ? this.messages[code] : this.messages.default;
        // Custom debugging information
        this.date = new Date();

    }
}

module.exports.ValidationError = ValidationError;