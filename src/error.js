/*!
 * MLP.API.Utilities.Error
 * File: error.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import debug from './lib/debug.utils.js';

'use strict';

export const messages = {
    23514: 'Email and/or password are empty or invalid.',
    '42P01': 'Database is misconfigured. Contact the site administrator for assistance.',
    login: 'Authentication failed. Please check your login credentials.',
    loginRedundant: 'Authentication failed. Please check your login credentials.',
    logout: 'Logging out failed. You are no longer signed in.',
    logoutRedundant: 'User is not signed in.',
    session: 'Session error. Contact the site administrator for assistance.',
    default: 'An error occurred. Your request could not be completed. Contact the site administrator for assistance.',
    restrict: 'Access denied!',
};


/**
 * Helper function to interpret error code.
 *
 * @private
 * @param {Error} err
 */

function getMessage(err = null) {
    return err.hasOwnProperty('message')
        ? messages.hasOwnProperty(err.message)
        ? messages[err.message]
            : messages.default : messages.default;
}

/**
 * Global error handler.
 *
 * @public
 * @param err
 * @param req
 * @param res
 * @param next
 */

export function globalHandler(err, req, res, next) {
    console.warn(err)
    return res.status(500).json({
        msg: getMessage(err),
        type: 'error'
    });
}

/**
 * Global page not found (404) handler. Assume 404 since
 * no middleware responded.
 *
 * @public
 * @param req
 * @param res
 * @param next
 */

export function notFoundHandler(req, res, next) {
    return res.status(404).json({
        msg: 'Requested page not found.',
        type: 'error'
    });
}
