/*!
 * MLP.Core.Controllers.Main
 * File: /controllers/main.controller.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

// globals
const modelName = 'main'

// preliminary handler
exports.before = async (req, res, next) => {
    // event-specific request parameters
    res.locals.modelName = modelName;
    next()
};

// Render main page / dashboard for logged-in users
exports.index = async (req, res, next) => {
    try {
        if (req.session.user)
            res.render('dashboard');
        else
            res.render('index');
    }
    catch(err) {
        next(err);
    }
};