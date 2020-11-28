/*!
 * Core.API.Router.Users
 * File: users.routes.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies
 */

import express from 'express'
import * as users from '../controllers/users.controller.js';
import db from '../services/database.services.js'
import LocalError from '../models/error.js';

/**
 * Express router
 */

let router = express.Router();
export default router;

/**
 * Initialization middleware.
 */

router.use(users.init)

/**
 * List users
 */

router.get('/users', users.list);

/**
 * Register user.
 */

router.route('/users/register')
    .all(function (req, res, next) {
        next()
    })
    .get(users.register)
    .post(users.add)

/**
 * Login user.
 */

router.route('/login')
    .all(function (req, res, next) {
        next()
    })
    .get(users.login)
    .post(users.authenticate)


/**
 * Show specified user.
 */

router.route('/users/:user_id')
    .all(function (req, res, next) {
        next()
    })
    .get(users.show)
    .put(function (req, res, next) {
        next(new Error('not implemented'))
    })
    .post(users.update)
    .delete(function (req, res, next) {
        next(new Error('not implemented'))
    })

/**
 * Delete specified user.
 */

router.route('/users/:user_id/delete')
    .all(function (req, res, next) {
        next()
    })
    .get(users.confirmRemove)
    .put(function (req, res, next) {
        next(new Error('not implemented'))
    })
    .post(users.remove)
    .delete(function (req, res, next) {
        next(new Error('not implemented'))
    })