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
import { prepare } from './lib/api.utils.js';

'use strict';

export const errors = {
    default: {
        hint: 'Generic error for server failure.',
        msg: 'Your request could not be completed. Contact the site administrator for assistance.',
        status: 500,
        type: 'error'
    },
    failedRegistration: {
        hint: 'User was not added to the database.',
        msg: 'Registration failed. Please check your registration details.',
        status: 401,
        type: 'error'
    },
    invalidLogin: {
        hint: 'Invalid login credentials.',
        msg: 'Authentication failed. Please check your login credentials.',
        status: 401,
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
        hint: 'User already logged out.',
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
        hint: 'JWT token is not correct for user.',
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
    notFound: {
        hint: 'Route does not exist.',
        msg: 'Page not found.',
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
    return err.hasOwnProperty('message')
        ? errors.hasOwnProperty(err.message)
        ? errors[err.message]
            : errors.default : errors.default;
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

    // send response
    return res.status(e.status).json(
        prepare({
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
            message: {
                msg: errors.notFound,
                type: 'error'
            }
        })
    );
}
