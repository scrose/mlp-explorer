/*!
 * MLP.Client.Utilities.Validator
 * File: validator.utils.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import { getError } from '../_services/schema.services.client';

/**
 * Export validator instance.
 */

export default Validator;

/**
 * Create input data validator.
 *
 * @param {Array} validations
 * @param {Array} refs
 * @public
 */

function Validator(validations, refs={}) {
    validations = ( typeof validations !== "undefined" ) ? validations : [];

    // resolve validation methods
    this.checks = validations.map(check => {
        return _inputValidations.hasOwnProperty(check)
          ? {
                name: check,
                run: _inputValidations[check]
            }
          : {
                name: check,
                run: () => {}
            };
    });

    // input references
    this.refs = refs;
}

/**
 * Apply validation checks to value and return any errors
 * on failure.
 *
 * @public
 * @param {String} val1
 * @param {String} val2 (Optional)
 * @return {String} error
 */

Validator.prototype.check = function check(val1, val2='') {
    return this.checks
            .filter(check => !check.run(val1, val2))
            .map(check => {
                return getError(check.name, 'validation')
            })
}

/**
 * Validation functions.
 *
 * @private
 */

const _inputValidations =
    {
        /**
         * Validate required input.
         */

        isRequired: (value) => {
            return value;
        },

        /**
         * Validate email address.
         */

        isEmail: (value) => {
            return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(value);
        },

        /**
         * Validate password value. Uses format: Minimum eight and maximum
         * 10 characters, at least one uppercase letter, one lowercase letter,
         * one number and one special character
         */

        isPassword: (value) => {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(value);
        },

        /**
         * Validate repeated password matches the password in the immediate
         * fieldset. Retrieves password value from reference callback.
         */

        isRepeatPassword: (repeatPassword='') => {

            if (typeof this === 'undefined') return '';
            console.log('Passwords:', this.refs.password, repeatPassword)

            return this.refs.hasOwnProperty('password')
                ? this.refs.password === repeatPassword : '';
        }
    }
