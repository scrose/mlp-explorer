/*!
 * MLP.Core.Models.UserRoles
 * File: /models/permissions.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const Model = require('./Base');

/**
 * Module exports.
 * @public
 */

module.exports = Role;

/**
 * Define Role data model schema
 *
 * @private
 */
let schema = {
  role_id: {
    label: 'ID',
    type: 'integer',
  },
  name: {
    label: 'Name',
    type: 'text',
  },
};

/**
 * Create User data model. Call base Model class as constructor.
 *
 * @private
 * @param data
 */
function Role(data = null) {
  Model.call(this, 'user_roles', 'User Role', schema, data);
}

/**
 * Inherit methods from Model abstract class.
 */

Role.prototype = Object.create(Model.prototype);
