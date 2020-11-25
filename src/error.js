/*!
 * MLP.Core.Utilities.Error
 * File: error.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

/**
 * Helper function to decode error.
 *
 * @private
 * @param {Error} err
 */

function getMessage(err=null) {
  if (err && err.hasOwnProperty('name') && err.name === 'LocalError') {
    return err.decoded;
  }
  // decode message
  else {
    return 'An error occurred. Your request could not be completed. ' + 'Contact the site administrator for assistance.';
  }
}

/**
 * Create message schema for rendering.
 *
 * @private
 * @param {String} msg
 */

function renderMessage(msg) {
    return JSON.stringify({
        div: {
            attributes: { class: 'msg error' },
            textNode: msg,
        },
    });
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
  // log error
  console.error('\n--- %s --- \n%s\n', err.hasOwnProperty('name') ? err.name : 'Validation Error', err, err.stack);

  res.locals.messages = [getMessage(err)];
  return res.status(500).json(res.locals);

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
    res.locals.messages=[getMessage()];
    res.status(404).json(res.locals);
}
