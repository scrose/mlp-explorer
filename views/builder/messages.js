/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Views.Builder.Messages
  Filename:     views/builder/messages.js
  ------------------------------------------------------
  Module to assist in building response messages schema.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 26, 2020
  ======================================================
*/


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
        login: 'Authentication failed. Please check your login credentials.',
        logout: 'Logging out failed. Contact the site administrator for assistance.',
        default: 'An error occurred. Your request could not be completed. Contact the site administrator for assistance.',
        restrict: 'Access denied!'
    }
}

// session message creator
exports.create = (e) => {
    if (!e) return;
    console.log(e)
    // get severity level
    let severity = (e.hasOwnProperty('severity')) ? (
        messages.hasOwnProperty(e.severity.toLowerCase()) ?
            e.severity.toLowerCase() : 'error' ) : 'error';
    // get message
    let message = (e.hasOwnProperty('code')) ? (
        messages[severity].hasOwnProperty(e.code) ?
            messages[severity][e.code] : messages[severity].default ) : messages[severity].default;
    return JSON.stringify({
        div:
            {
                attributes: {class: 'msg ' + severity},
                textNode: message
            }
    });
}
