/*!
 * Core.Utilities.Permissions
 * File: /lib/permissions.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';
const params = require('../config');
const LocalError = require('../models/error')
const userServices = require('../services')({ type: 'users' });


exports.authorize = async (req, res, next) => {
    if (!res.locals.user) return

    // authorize user
    await userServices.findById( res.locals.user.id )
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError("nouser");
            res.locals.restrict = result.rows[0].role_id
        })
        .catch((err) => next(err));
}

