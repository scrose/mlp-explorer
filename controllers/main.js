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
const params = require('../params')

// preliminary handler
exports.before = async (req, res, next) => {

    // Add boilerplate content
    req.view = params.settings.general;

    // event-specific request parameters
    req.view.modelName = modelName;

    // response messages
    req.view.messages = req.session.messages || null;

    // menus
    req.view.menus = {
        breadcrumb: req.breadcrumbs,
        user: req.userMenu
    }

    // utilities
    // TODO: move data preprocessing out of view
    req.view.utils = utils;

    // user-specific request/session parameters
    req.user = req.session.user || null;

    next()

};

// Render main page
exports.index = async (req, res, next) => {
    try {
        res.render('index', {
            content: req.view,
        });
        res.cleanup();
    }
    catch(e) {
        res.message(e);
    }
};