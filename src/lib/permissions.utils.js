/*!
 * Core.Utilities.Permissions
 * File: /lib/permissions.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import ControlError from '../models/error.models.js';
import * as db from '../services/db.services.js';
import { roles, permissions } from '../config.js';

/**
 * Set user permissions level by user role.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export function authorize(req, res, next) {

    // Anonymous user: set full restrictions to next process
    res.locals.restrict = 0;
    if (typeof res.locals.user === 'undefined') return next();

    // Get user role
    db.users
        .select(res.locals.user.id)
        .then((result) => {
            if (result.rows.length === 0) throw new ControlError('nouser');
            res.locals.restrict = result.rows[0].role_id;
            return next();
        })
        .catch((err) => next(err));
}

/**
 * Restrict user access based on permissions.
 *
 * @param res
 * @param next
 * @param view
 * @param paramId
 * @src public
 *
 */

export function restrict(res, next, view, paramId = null) {
    try {
        const restrictedTo = getPermissions(res.locals.view, view);
        // Allow owners access to own data
        if (res.locals.user && res.locals.user.id === paramId) next();
        // Deny users with lesser admin privileges
        if (!res.locals.restrict || res.locals.restrict < restrictedTo) {
            throw new ControlError('restrict');
        }
        next();
    } catch (err) {
        next(err);
    }
}

/**
 * Confirm if user access is restricted based on permissions.
 *
 * @param res
 * @param view
 * @param ownerId
 * @src public
 *
 */

export function isRestricted(res, view, ownerId = null) {
    const level = getPermissions(res.locals.view, view);
    // Allow owner access
    if (res.locals.user && res.locals.user.id === ownerId) return true;
    // Deny users with lower privileges
    return !(!res.locals.permit || res.locals.permit < level);
}

/**
 * Get permissions from configuration settings.
 *
 * @param model
 * @param view
 * @src public
 *
 */

function getPermissions(model, view) {
    // choose defined or default permissions grouping
    const modelPermissions = permissions.hasOwnProperty(view)
        ? permissions[view]
        : permissions.default;
    // choose defined or default view permissions
    return modelPermissions.hasOwnProperty(view)
        ? roles[modelPermissions[view]]
        : roles.Visitor;
}
