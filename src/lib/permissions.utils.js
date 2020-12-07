/*!
 * Core.Utilities.Permissions
 * File: /lib/permissions.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as db from '../services/index.services.js';
import { roles, permissions } from '../../config.js';

/**
 * Set user permissions level by user role.
 *
 * @param {Request} req
 * @param {Response} res
 * @param next
 * @src public
 */

export const authorize = async (req, res, next) => {

    // Anonymous user: set full restrictions to next process
    res.locals.restrict = 0;
    if (typeof res.locals.user === 'undefined') return next();

    // Get user role
    return await db.users
        .select(res.locals.user.id)
        .then((result) => {
            if (result.rows.length === 0) throw new Error('nouser');
            res.locals.restrict = result.rows[0].role_id;
            return next();
        })
        .catch((err) => next(err));
}

/**
 * Restrict user access based on permissions.
 *
 * @param {Response} res
 * @param {NextFunction} next
 * @param {Object} args
 * @src public
 *
 */

export function restrict(res, next, args) {
    try {
        const restrictedTo = getPermissions(args);
        // Allow owners access to own data
        if (res.locals.user
            && args.hasOwnProperty('id')
            && res.locals.user.id === args.id
        ) return next();
        // Deny users with lesser admin privileges
        if (typeof res.locals.restrict === 'undefined' || res.locals.restrict < restrictedTo) {
            return next(new Error('restrict'));
        }
        return next();
    } catch (err) {
        return next(err);
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
 * @param {Object} args
 * @return {Integer} permission level
 * @src public
 *
 */

function getPermissions(args) {
    // choose defined or default permissions grouping
    const modelPermissions = permissions.hasOwnProperty(args.model)
        ? permissions[args.model]
        : permissions.default;
    // choose defined or default view permissions
    return modelPermissions.hasOwnProperty(args.view)
        ? roles[modelPermissions[args.view]]
        : roles.visitor;
}
