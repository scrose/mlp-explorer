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

import { prepare } from './lib/api.utils.js';

'use strict';

export const errors = {
    default: {
        hint: 'Generic error for server failure.',
        msg: 'Your request could not be completed. Contact the site administrator for assistance.',
        status: 500,
        type: 'error'
    },
    invalidData: {
        hint: 'Invalid input data (generic).',
        msg: 'Invalid data. Please check the data fields for errors.',
        status: 422,
        type: 'error'
    },
    invalidEmail: {
        hint: 'Invalid email.',
        msg: 'Invalid email address.',
        status: 422,
        type: 'error'
    },
    invalidCredentials: {
        hint: 'Invalid login credentials.',
        msg: 'Authentication failed. Please check your login credentials.',
        status: 422,
        type: 'error'
    },
    failedLogin: {
        hint: 'Incorrect login credentials.',
        msg: 'Authentication failed. Please check your login credentials.',
        status: 401,
        type: 'error'
    },
    redundantLogin: {
        hint: 'User already logged in.',
        msg: 'User is already logged in!',
        status: 403,
        type: 'warning'
    },
    noLogout: {
        hint: 'Logout failed at controller.',
        msg: 'Logging out failed. You are no longer signed in.',
        status: 403,
        type: 'error'
    },
    redundantLogout: {
        hint: 'User token not found in request to logout.',
        msg: 'User is already logged out!',
        status: 403,
        type: 'warning'
    },
    restricted: {
        hint: 'User does not have sufficient admin privileges.',
        msg: 'Access denied!',
        status: 403,
        type: 'error'
    },
    noAuth: {
        hint: 'JWT token is expired or invalid for user.',
        msg: 'Unauthorized access!',
        status: 401,
        type: 'error'
    },
    noToken: {
        hint: 'JWT authorization token was not set.',
        msg: 'Access denied!',
        status: 403,
        type: 'error'
    },
    noRecord: {
        hint: 'Record is missing in database. Likely an incorrect identifier.',
        msg: 'Record not found!',
        status: 403,
        type: 'error'
    },
    schemaMismatch: {
        hint: 'User input data found to be invalid for a given model schema. Check setData() method in constructor.',
        msg: 'Input data does not match model schema.',
        status: 500,
        type: 'error'
    },
    '23505': {
        hint: 'Unique record duplicated in database.',
        msg: 'Record already exists with that key.',
        status: 422,
        type: 'error'
    },
    notFound: {
        hint: 'Route is not implemented in the router.',
        msg: 'Requested route not found.',
        status: 404,
        type: 'error'
    }
};


/**
 * Helper function to interpret error code.
 *
 * @private
 * @param {Error} err
 */

function decodeError(err = null) {

    // dereference error data
    const { message='', code='' } = err || {};

    // Check for Postgres error codes
    const key = code ? code : message;

    return errors.hasOwnProperty(key) ? errors[key] : errors.default;
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
    const e = decodeError(err);

    // report to logger
    console.error(`ERROR (${err.message})\t${e.msg}\t${e.status}\t${e.hint}`)
    console.error(`Details:\n\n${err}\n\n`)

    // send response
    return res.status(e.status).json(
        prepare({
            view: e.status,
            message: {
                msg: e.msg,
                type: e.type
            }
        })
    );
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
    return res.status(404).json(
        prepare({
            view: 'notFound',
            message: {
                msg: errors.notFound.msg,
                type: 'error'
            }
        })
    );
}
