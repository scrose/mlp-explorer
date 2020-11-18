/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------

  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: September 29, 2020
  ------------------------------------------------------
  Module:       Core.Controllers.Main
  Filename:     controllers/main/main.js
  ======================================================
*/

/* global constants */
const modelName = 'main'

// preliminary handler
exports.before = async (req, res, next) => {

    // event-specific request parameters
    req.view.modelName = modelName;
    next()

};

// Render main page
exports.index = async (req, res, next) => {
    try {
        res.render('index', {
            content: req.view,
        });
    }
    catch(err) {
        next(err);
    }
};