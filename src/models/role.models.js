/*!
 * MLP.API.Models.UserRoles
 * File: role.composer.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import {createModel} from './composer.services.js';
import schema from './schemas/roles.schema.js';
import { defineMethod } from '../lib/object.js';
import * as queries from '../services/queries/roles.queries.js';

/**
 * Create UserModel data model. Inherit
 * methods, properties from Composer abstract class.
 *
 * @private
 * @param data
 */

let Role = createModel(schema);

/**
 * Module exports.
 * @public
 */

export default Role;

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
