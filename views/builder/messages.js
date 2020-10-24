/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Views.FormBuilder
  Filename:     views/builder/validator.js
  ------------------------------------------------------
  Module to assist in building HTML forms from data
  layer.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 2, 2020
  ======================================================
*/


classNames = {
    info: 'fa fa-info-circle',
    success: 'fa fa-check',
    warning: 'fa fa-warning',
    error: 'fa fa-times-circle'
}

messages = {
    info: {

    },
    success: {
        'default': "Successfully updated."
    },
    warning: {},
    error: {
        '23514': 'Registration email is empty or invalid.',
        '42P01': 'Database is misconfigured. Contact the site administrator for assistance.',
        default: "An error occurred. Your request could not be completed. Contact the site administrator for assistance."
    }
}

// session message creator
exports.buildMessage = (e, severity, code) => {
    if (!e && (!severity || !code)) return;
    // get database error if it exists
    let errorMessage = (e) ? (
        messages.error.hasOwnProperty(e.code) ?
            messages.error[e.code] : messages.error.default ) : '';
    // get additional indexed message (if provided)
    let messageSeverity = (e) ? 'error' : ( severity ? severity : 'info' );
    let customMessage = (code && severity) ? messages[severity][code] : '';
    return JSON.stringify({
        div:
            {
                attributes: {class: 'msg ' + messageSeverity},
                textNode: customMessage + ' ' + errorMessage
            }
    });
}
