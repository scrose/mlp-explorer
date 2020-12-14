/*!
 * MLP.API.Utilities.Permissions
 * File: permissions.utils.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as db from '../services/index.services.js';

/**
 * Set user permissions level by user role.
 *
 * @param {Request} req
 * @param {Response} res
 * @param next
 * @src public
 */

export const authorize = async (req, res, next) => {

    // default anonymous user: set full restrictions to next process
    res.locals.restrict = 'visitor';
    if (typeof res.locals.user === 'undefined') return next();

    // Otherwise get current user role
    return await db.users
        .select(res.locals.user.id)
        .then((result) => {
            if (result.rows.length === 0) throw new Error('nouser');
            res.locals.restrict = result.rows[0].role;
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

export function restrict (res, next, args) {
    try {

        // get permissions settings for model and view
        const restrictedTo = getPermissions(args);

        console.log('RESTRICTED TO: ', restrictedTo)

        // Allow owners access to own data
        if (res.locals.user
            && args.hasOwnProperty('id')
            && res.locals.user.id === args.id
        ) return next();

        // Deny users with lesser admin privileges
        if (typeof res.locals.restrict === 'undefined' || !restrictedTo.includes(res.locals.restrict) ) {
            return next(new Error('restrict'));
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

/**
 * Get permissions from configuration settings.
 *
 * @param {Object} args
 * @return {Integer} permissions role
 * @src public
 *
 */

function getPermissions(args) {

    // assert model and permissions are defined
    if (!args || !args.hasOwnProperty('model') || !args.hasOwnProperty('permissions'))
        throw new Error('invalidPermissions');

    // select defined model or default permissions
    let permissions = args.permissions.hasOwnProperty(args.model)
        ? args.permissions[args.model]
        : args.permissions.default;

    console.log(args.view, permissions)

    // filter permissions for given view
    return permissions
        .filter(viewPermissions => {
            return viewPermissions.view === args.view;
        })
        .map(permission => {
            return permission.role;
        });
}
