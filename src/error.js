/*!
 * MLP.Core.Utilities.Error
 * File: /lib/Error.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import path from 'path';

/**
 * Helper function to decode error and create message schema
 *
 * @private
 * @param {Error} err
 */

function decode(err) {
  let msg;
  if (err.name === 'LocalError') {
    msg = err.decoded;
  }
  // decode message
  else {
    msg = 'An error occurred. Your request could not be completed. ' + 'Contact the site administrator for assistance.';
  }

  // return JSON schema for user error message
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

  res.locals.messages = [decode(err)];
  return res.status(500).render(path.join(__dirname, 'views/main'), { content: req.view });

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

export function notFoundHandler(req, res, next) {
  res.status(404).render('404', { content: req.locals, url: req.originalUrl });
}
