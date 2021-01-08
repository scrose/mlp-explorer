/*!
 * MLP.Client.Utilities.Validator
 * File: validator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import schema from '../schema';

/**
 * Export validator instance.
 */

export default new Validator();


/**
 * Create Validator object.
 *
 * @public
 */

function Validator() {
  this.data = {};
  this.error = '';
}

/**
 * End validation train.
 *
 * @private
 * @param {String} code
 * @throws {Error} validation error
 */

Validator.prototype.end = function () {
    const msg = this.error;
    this.error = '';
    return msg;
};

/**
 * Stores validation error. Returns first error in
 * validation chain.
 *
 * @private
 * @param {String} err
 * @throws {Error} validation error
 */

Validator.prototype.setError = function (err = null) {
    console.warn(err);
    this.error = err && this.error === '' ? err : this.error;
};

/**
 * Initialize validateUtils.
 *
 * @private
 * @param {Object} data
 * @return {Validator} validateUtils instance
 */

Validator.prototype.load = function (data) {
  this.data = data;
  return this;
};

/**
 * Validate required input.
 *
 * @private
 * @param {String} value
 * @return {Boolean} validation result
 */

Validator.prototype.isRequired = function () {
  if (!this.data)
      this.setError(schema.errors.formValidation.isRequired);
  return this;
};

/**
 * Validate email address.
 *
 * @private
 * @param {String} value
 * @return {Boolean} validation result
 */

Validator.prototype.isEmail = function () {
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(this.data))
      this.setError(schema.errors.formValidation.isEmail);
  return this;
};

/**
 * Validate password value. Uses format: Minimum eight and maximum
 * 10 characters, at least one uppercase letter, one lowercase letter,
 * one number and one special character
 *
 * @private
 * @param {String} value
 * @return {Boolean} validation result
 */

Validator.prototype.isPassword = function () {
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(this.data))
      this.setError(schema.errors.formValidation.isPassword);
  return this;
};

/**
 * Validate that repeat password matches password.
 *
 * @private
 * @param {String} value
 * @return {Boolean} validation result
 */

Validator.prototype.isRepeatPassword = function (password) {
  if (password !== this.data)
      this.setError(schema.errors.formValidation.isRepeatPassword);
  return this;
};
