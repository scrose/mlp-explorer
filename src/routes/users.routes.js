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
import { restrict } from '../lib/permissions.utils.js';

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
 * Login user.
 */

router.route('/login')
    .all(function (req, res, next) {
        restrict(res, next, {model: 'users', view: 'login'});
    })
    .get(users.login)
    .post(users.authenticate)

/**
 * Login user.
 */

router.route('/logout')
    .all(function (req, res, next) {
        restrict(res, next, {model: 'users', view: 'logout'});
    })
    .post(users.logout)

/**
 * List users
 */

router.route('/users')
    .all(function (req, res, next) {
        restrict(res, next, {model: 'users', view: 'list'});
    })
    .get(users.list);

/**
 * Register user.
 */

router.route('/users/register')
    .all(function (req, res, next) {
        restrict(res, next, {model: 'users', view: 'register'});
    })
    .get(users.register)
    .post(users.create)

/**
 * Show user data.
 */

router.route('/users/:user_id')
    .all(function (req, res, next) {
        restrict(res, next, {model: 'users', view: 'show', id: req.params.user_id});
    })
    .get(users.show)
    .put(function (req, res, next) {
        next(new Error('not implemented'))
    })
    .delete(function (req, res, next) {
        next(new Error('not implemented'))
    })

/**
 * Edit/update user data.
 */

router.route('/users/:user_id/edit')
    .all(function (req, res, next) {
        restrict(res, next, {model: 'users', view: 'edit', id: req.params.user_id});
    })
    .get(users.edit)
    .put(function (req, res, next) {
        next(new Error('not implemented'))
    })
    .post(users.update)
    .delete(function (req, res, next) {
        next(new Error('not implemented'))
    })

/**
 * Delete user.
 */

router.route('/users/:user_id/remove')
    .all(function (req, res, next) {
        restrict(res, next, {model: 'users', view: 'remove', id: req.params.user_id});
    })
    .get(users.remove)
    .put(function (req, res, next) {
        next(new Error('not implemented'))
    })
    .post(users.drop)
    .delete(function (req, res, next) {
        next(new Error('not implemented'))
    })
