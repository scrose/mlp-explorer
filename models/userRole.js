/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Classes.UserRole
  File:         /classes/userRole.js
  ------------------------------------------------------
  User role data model (JS Class).
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 31, 2020
  ======================================================
*/

'use strict';

const Model = require('./base')

class UserRole extends Model {
    constructor (...params) {
        // Pass Model arguments
        super(...params)

        this.modelName = 'user_roles';
        this.modelLabel = 'User Roles';
        this.modelSchema = {
            id: {
                label: 'ID',
                    type: 'integer',
                    render: {
                    select: {
                        option: 'name',
                            value: 'id'
                    }
                },
            },
            name: {
                label: 'Name',
                    type: 'text',
            }
        }
    }
}

// export class
module.exports = UserRole