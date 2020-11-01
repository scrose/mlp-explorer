/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Utilities.Error
  File:         /_utilities/error.js
  ------------------------------------------------------
  Helper methods for handling error
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 9, 2020
  ======================================================
*/

'use strict';

let messages = {
    info: {
        default: ''
    },
    success: {
        register: 'User successfully registered.',
        login: "Logged in successfully.",
        logout: "Logged in successfully.",
        default: "Successfully updated."
    },
    warning: {
        default: ''
    },
    error: {
        '23514': 'Email and/or password are empty or invalid.',
        '42P01': 'Database is misconfigured. Contact the site administrator for assistance.',
        nouser: 'Requested user was not found.',
        register: "Registration failed. Please contact the site maintainer.",
        login: 'Authentication failed. Please check your login credentials.',
        logout: 'Logging out failed. Contact the site administrator for assistance.',
        default: 'An error occurred. Your request could not be completed. Contact the site administrator for assistance.',
        restrict: 'Your account is not authorized to access this page.'
    }
}

exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;

// Global error handler
function errorHandler(err, req, res, next) {
    // log error
    console.error(err);

    // handle database check violations
    if (err.hasOwnProperty('code')) {
        let msg = (messages.error.hasOwnProperty(err.code)) ? messages.error[err.code] : messages.error.default;
        // set error message for user
        req.view.messages = [JSON.stringify({
            div:{
                attributes: {class: 'msg error'},
                textNode: msg}
        })];
        return res.status(400).render('main', { content: req.view });

    }

    if (err.name === 'ValidationError') {
        // set error message for user
        req.view.messages = [JSON.stringify({
            div:{
                attributes: {class: 'msg error'},
                textNode: err.message}
        })];
        return res.status(400).render('main', { content: req.view });
    }

    if (err.name === 'TypeError' || err.name === 'ReferenceError') {
        // set error message for user
        req.view.messages = [JSON.stringify({
            div:{
                attributes: {class: 'msg error'},
                textNode: messages.error.default}
        })];
        return res.status(400).render('main', { content: req.view });
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).render('main', { content: req.view, url: req.originalUrl });
    }

    // default to 500 server error
    return res.status(500).render('5xx', { message: err.message });
}


// Page not found (404) handler
function notFoundHandler (req, res, next){
    // assume 404 since no middleware responded
    res.status(404).render('404', { content: req.view, url: req.originalUrl });
};

