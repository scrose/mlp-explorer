/*!
 * MLP.Core.Controllers.Main
 * File: /controllers/main.js
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

// Render main page
exports.index = async (req, res, next) => {
    try {
        res.render('index');
    }
    catch(err) {
        next(err);
    }
};