
/*!
 * MLP.Core.Classes.Error
 * File: /classes/error.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const utils = require('../_utilities');

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
 * Helper function to lookup error messages by code.
 *
 * @private
 * @param code
 */
function lookup(code = null) {
    return errorMessages.hasOwnProperty(code) ? errorMessages[code] : errorMessages.default;
}

/**
 * Module exports.
 * @public
 */

module.exports = GeneralError;

/**
 * Create General (custom) Error data model.
 *
 * @private
 * @param err
 */

function GeneralError(err) {
    // Object.defineProperty(this, 'code', {
    //     value: (err.hasOwnProperty('code')) ? err.code : 'default',
    //     writable: false
    // });
    //
    // Object.defineProperty(this, 'date', {
    //     value: new Date(),
    //     writable: false
    // });
    //
    // Object.defineProperty(this, 'message', {
    //     value: lookup(this.code),
    //     writable: true
    // });

}

/**
 * Create JSON schema for error message.
 *
 * @param {Object} data
 * @api public
 */

// utils.obj.defineMethod(GeneralError, 'json', function () {
//     return JSON.stringify({
//         div:{
//             attributes: {class: 'msg error'},
//             textNode: this.message}
//     })
// });

