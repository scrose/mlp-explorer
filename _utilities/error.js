/*!
 * MLP.Core.Utilities.Error
 * File: /_utilities/error.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const GeneralError = require('../models/error');

/**
 * Module exports.
 * @public
 */

exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;

/**
 * Define Error messages for lookup.
 *
 * @private
 */

let errorMessages = {
    '23514': 'Email and/or password are empty or invalid.',
    '42P01': 'Database is misconfigured. Contact the site administrator for assistance.',
    login: 'Authentication failed. Please check your login credentials.',
    logout: 'Logging out failed. Contact the site administrator for assistance.',
    session: 'Session error. Contact the site administrator for assistance.',
    default: 'An error occurred. Your request could not be completed. Contact the site administrator for assistance.',
    restrict: 'Access denied!'
};


/**
 * Helper function to decode error and create message schema
 *
 * @private
 * @param {Error} err
 */

function decodeMessage(err) {
    let code;
    if (typeof err === 'string') code = err;
    if (typeof err === 'object')
        code = err.hasOwnProperty('code') ? err.code : 'default';
    let msg = errorMessages.hasOwnProperty(code) ? errorMessages[err] : errorMessages.default;

    // return JSON schema for user error message
    return JSON.stringify({
        div: {
            attributes: {class: 'msg error'},
            textNode: msg
        }
    })
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

function errorHandler(err, req, res, next) {

    // log error
    console.error('\n--- %s --- \n%s\n',
        err.hasOwnProperty('name') ? err.name : 'Validation Error', err);

    req.view.messages = [decodeMessage(err)];
    return res.status(500).render('main', { content: req.view });

    // // default to 5xx server error
    // return res.status(500).render('5xx', { message: err.message });
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

function notFoundHandler (req, res, next){
    res.status(404).render('404', { content: req.view, url: req.originalUrl });
}

