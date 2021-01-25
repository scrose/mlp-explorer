/*!
 * MLP.API.Controllers.Main
 * File: main.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { prepare } from '../lib/api.utils.js';

/**
 * Controller initialization.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const init = async (req, res, next) => {
    return next();
};

/**
 * Default request controller.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const show = async (req, res, next) => {
  try {
      res.status(200).json(
          prepare({
              view: 'dashboard'
          }));
  } catch (err) {
    return next(err);
  }
};
