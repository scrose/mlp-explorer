/*!
 * MLP.API.Utilities.Permissions
 * File: permissions.utils.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Get permissions from configuration settings.
 *
 * @param {Object} args
 * @return {Array} allowed roles
 * @src public
 *
 */

export const getPermissions = (args) => {

    // assert model and permissions are defined
    if (!args || !args.hasOwnProperty('model') || !args.hasOwnProperty('permissions'))
        throw new Error('invalidPermissions');

    // select defined model or default permissions
    let permissions = args.permissions.hasOwnProperty(args.model)
        ? args.permissions[args.model]
        : args.permissions.default;

    // filter permissions for given view
    return permissions
        .filter(viewPermissions => {
            return viewPermissions.view === args.view;
        })
        .map(permission => {
            return permission.role;
        });
}
