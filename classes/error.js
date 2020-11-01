/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Classes.ValidationError
  File:         /classes/model.js
  ------------------------------------------------------
  Validation error class (extends JS Error native superclass)
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 31, 2020
  ======================================================
*/

'use strict';

class ValidationError extends Error {
    constructor(code='default', ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params)

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError)
        }

        this.name = 'ValidationError';
        this.code = code;
        // Custom debugging information
        this.date = new Date();
    }
}

module.exports.ValidationError = ValidationError;