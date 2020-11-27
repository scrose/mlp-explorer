/*!
 * MLP.API.Models.UserRoles
 * File: role.model.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import Model from './model.js';
import schema from './schemas/roles.schema.js';
import { defineMethod } from '../lib/object.js';
import * as queries from './queries/roles.queries.js';

/**
 * Module exports.
 * @public
 */

export default Role;

/**
 * Create UserModel data model. Call base Model class as constructor.
 *
 * @private
 * @param data
 */
function Role(data = null) {
  Model.call(this, 'user_roles', 'UserModel RoleModel', schema, data);
}

/**
 * Inherit methods from Model abstract class.
 */

Role.prototype = Object.create(Model.prototype);

/**
 * Find all user roles.
 *
 * @public
 * @return {Promise} result
 */

defineMethod(Role, 'findAll', async () => {
  return this.query(queries.findAll, []);
});

/**
 * Remove role.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

defineMethod(Role, 'remove', async (role_id) => {
  return this.query(queries.remove, [role_id]);
});
