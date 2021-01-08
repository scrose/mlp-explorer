/*!
 * MLP.API.Controllers.Main
 * File: main.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

// Render main page / dashboard for logged-in users
export const index = async (req, res, next) => {
  try {
    res.status(200).json(res.locals);
  } catch (err) {
    next(err);
  }
};
