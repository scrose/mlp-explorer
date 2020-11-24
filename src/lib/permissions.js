/*!
 * Core.Utilities.Permissions
 * File: /lib/permissions.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import LocalError from '../models/Error.js';
import * as userServices from '../services/users.services.js';
import { roles, permissions } from '../config.js';

/**
 * Set user permissions level by user role.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

export function authorize(req, res, next) {
  // Anonymous user: full restrictions
  res.locals.permit = 0;
  if (typeof res.locals.user === 'undefined') return next();

  // get user role
  userServices
    .findById(res.locals.user.id)
    .then((result) => {
      if (result.rows.length === 0) throw new LocalError('nouser');
      res.locals.permit = result.rows[0].role_id;
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
 * @param ownerId
 * @api public
 *
 */

export function restrict(res, next, view, ownerId = false) {
  try {
    const level = getPermissions(res.locals.view, view);
    // Allow owners access
    if (res.locals.user && res.locals.user.id === ownerId) return;
    // Deny users with lower privileges
    if (!res.locals.permit || res.locals.permit < level) {
      throw LocalError('restrict');
    }
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
 * @api public
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
 * Get permissions from configuration file.
 *
 * @param model
 * @param view
 * @api public
 *
 */

function getPermissions(model, view) {
  const modelPermissions = permissions.hasOwnProperty(model) ? permissions[model] : permissions.default;
  return modelPermissions.hasOwnProperty(view) ? roles[modelPermissions[view]] : roles.Visitor;
}
