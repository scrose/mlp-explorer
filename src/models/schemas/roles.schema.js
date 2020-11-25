/*!
 * MLP.Core.Models.Schema.Roles
 * File: roles.schema.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Define Role data model schema
 *
 * @private
 */
export default {
  role_id: {
    label: 'ID',
    type: 'integer',
  },
  name: {
    label: 'Name',
    type: 'text',
  },
};