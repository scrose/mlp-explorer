/*!
 * MLP.API.Utilities.Validator
 * File: /lib/validator.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

const LocalError = require('../../models/Error');

/**
 * Create validator instance.
 */

let validator = new Validator();

/**
 * Module exports.
 */

module.exports = (data) => {
  return validator.init(data);
};

/**
 * Create Validator object.
 *
 * @public
 */

function Validator() {
  this.data = {};
}

/**
 * Generate validation error.
 *
 * @private
 * @param {String} code
 * @throws {Error} validation error
 */

Validator.prototype.error = function (code = null) {
  throw new LocalError(code);
};

/**
 * Initialize validator.
 *
 * @private
 * @param {Object} data
 * @return {Validator} validator instance
 */

Validator.prototype.init = function (data) {
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
  if (!!!this.value) this.error();
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
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(this.data)) this.error();
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
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(this.data)) this.error();
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
  if (password !== this.data) this.error();
  return this;
};
