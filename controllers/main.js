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

const params = require('../params')

// Render main page
exports.index = async (req, res, next) => {
    try {
        req.content = params.settings.general;
        res.render('index', {
            messages: req.session.messages || [],
            model: 'Home',
            content: req.content,
            breadcrumb_menu: req.breadcrumbs,
        });
        res.cleanup();
    }
    catch(e) {
        console.log(e)
    }
};