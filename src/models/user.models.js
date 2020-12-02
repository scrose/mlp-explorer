/*!
 * MLP.API.Models.User
 * File: user.models.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import createModel from './composer.services.js';
import { genID, genUUID, encrypt } from '../lib/secure.utils.js'

/**
 * Create User data model.
 *
 * @private
 * @param data
 */

let User = await createModel('users');

/**
 * Module exports.
 * @public
 */

export default User;


