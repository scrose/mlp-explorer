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
        'db-1': "Database successfully updated."
    },
    warning: {},
    error: {
        '23514': 'Registration email is empty or invalid.',
        '42P01': 'Database misconfigured',
        'default': "An error occurred. Your request could not be completed. Contact the site administrator for assistance."
    }
}

// session message creator
exports.buildMessage = (e, msg, sev) => {
    console.log(e)
    // get database error code if it exists
    let code = (e) ? e.code : null;
    // get database error severity if it exists, otherwise use parameter
    let severity = (e) ? e.severity.toLowerCase() : (sev) ? sev : null;
    // get the indexed message, otherwise use the parameter
    let message = (code && severity) ? messages[severity][code] : msg;
    if (!message) return;
    return JSON.stringify({
        div:
            {
                attributes: {class: 'msg ' + severity},
                textNode: message
            }
    });
}
