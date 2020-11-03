/*!
 * MLP.Core.Controllers.Users
 * File: /controllers/user.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

const LocalError = require("../models/error");

/**
 * Create validator instance.
 *
 * @param {Object} data
 * @api public
 */

module.exports = (id, data) => {
    return {
        id: id,
        data:  data,
        error: (msg) => {
            throw new LocalError(msg);
        },

        // Check if object is empty
        // NOTE: This should work in ES5 compliant implementations.
        isEmpty: () => {
            if (!Object.keys(data).length) this.error('Field %s is not empty.', id);
            return this;
        },
        isRequired: () => {
            if (!!!value) this.error('Item is required.');
            return this;
        },
        // format: user@example.com
        isEmail: () => {
            if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(value)) {
                this.error('Email %s is invalid.', data);
            }
        },
        // format: Minimum eight and maximum 10 characters, at least one uppercase letter,
        // one lowercase letter, one number and one special character
        isPassword: () => {
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/.test(value)) {
                this.error('Password is invalid.');
            }
            return this;
        },
        // format: Minimum eight and maximum 10 characters, at least one uppercase letter,
        // one lowercase letter, one number and one special character
        isRepeatPassword: (pwd) => {
            if (pwd === data) {
                this.error('Repeat password is invalid.');
            }
            return this;
        }
    }
}







