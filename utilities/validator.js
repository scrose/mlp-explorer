/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Utilities.Data
  File:         /utilities/data.js
  ------------------------------------------------------
  Utility methods for handling data
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 9, 2020
  ======================================================
*/

'use strict';

// Create validator object
module.exports = (body) => {
    return {
        data: {
            body
        },
        errors: [],

        // Check if object is empty
        // NOTE: This should work in ES5 compliant implementations.
        isEmpty: () => {
            const {errors, data} = this;
            let e = !Object.keys(data).length;
            errors.push(e);
        },

        // check for valid email address
        isEmail: () => {
            console.log(this, e)
            this.errors.push(e);
        },

        // retrieve accumulated validation errors
        getErrors: () => {
            return this.errors;
        }
    }
}







