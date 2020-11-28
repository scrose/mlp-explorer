/*!
 * MLP.API.Controllers.Users
 * File: users.controller.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import User from '../models/user.js';
import Role from '../models/role.js';
import LocalError from '../models/error.js';
import path from 'path';
import * as config from '../config.js';
import { restrict } from '../lib/permissions.js';
import db from '../services/database.services.js';
import valid from '../lib/validate.utils.js'

/**
 * List all users
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */
export const init = async (req, res, next) => {
    await db
        .init(
            'users',
            [process.env.API_USER, process.env.API_EMAIL, process.env.API_HASH, process.env.API_SALT]
        )
        .then(() => next())
        .catch((err) => next(err));
};

/**
 * List all users
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */
export const list = async (req, res, next) => {
    // restrict(res, next, 'list');
    await db
        .getAll('users')
        .then((data) => {
            res.locals.users = data.rows;
            res.status(200).json(res.locals);
        })
        .catch((err) => {
            next(err);
        });
};

/**
 * Show the user's profile data. Only the profile of the current user
 * is accessible, unless the user has administrator privileges.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const show = async (req, res, next) => {
    // restrict(res, next, config.roles.Administrator, res.locals.req_id);
    await db
        .select('users', req.params.user_id)
        .then((data) => {
            if (data.rows.length === 0) throw new LocalError('nouser');
            res.status(200).json({ user: data.rows[0] });
        })
        .catch((err) => next(err));
};

/**
 * UserModel sign-in interface.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const login = async (req, res, next) => {
    try {
        // let args = {
        //   model: new UserModel(),
        //   view: res.locals.view,
        //   method: 'POST',
        //   legend: 'UserModel Sign In',
        //   actions: {
        //     submit: { value: 'Sign In', url: '/login' },
        //     cancel: { value: 'Cancel', url: '/' },
        //   },
        //   restrict: req.session.user || null,
        // };
        // let { form, validator } = builder.form(args);
        // res.locals.form = form;
        // res.locals.validator = validator;
        res.status(200).json(res.locals);
    } catch (err) {
        next(err);
    }
};

/**
 * Logout current user from session.
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const logout = async (req, res, next) => {
    try {
        console.log('Logging out:', req.session.user);
        if (!req.session.user) throw new LocalError('logoutRedundant');
        // Regenerate session as anonymous when signing out
        req.session.regenerate(function(err) {
            if (err) throw LocalError(err);
            res.message('Successfully logged out!', 'success');
            req.session.save(function(err) {
                if (err) throw LocalError(err);
                // session saved
                res.redirect('/');
            });
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Authenticate user credentials.
 * TODO: Include JWT signing (http://jwt.io/)
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const authenticate = async (req, res, next) => {
    // validate user credentials
    let reqUser;
    try {
        const { email, password } = req.body;
        reqUser = {
            email: utils.validate(email).isEmail().data,
            password: utils.validate(password).isPassword().data,
        };
    } catch (err) {
        next(err);
    }

    // confirm user exists
    await userServices
        .findByEmail(reqUser.email)
        .then((result) => {
            if (result.rows.length === 0) throw LocalError('loginFailure');

            // wrap requested user data for authentication
            let authUser = new User(result);

            // authenticate user credentials
            if (!authUser.authenticate(reqUser.password)) throw LocalError('login');

            // Regenerate session when signing in to prevent fixation
            req.session.regenerate(function(err) {
                if (err) throw LocalError(err);
                // Store user object in the session store to be retrieved
                req.session.user = {
                    id: authUser.getValue('user_id'),
                    email: authUser.getValue('email'),
                };
                res.message('Login successful.', 'success');
                req.session.save(function(err) {
                    if (err) throw LocalError(err);
                    // session saved
                    res.redirect('/');
                });
            });
        })
        .catch((err) => {
            next(err);
        });
};

/**
 * UserModel registration interface. Note: registration is currently
 * restricted to Administrators, but can be open to visitors by
 * removing restrict().
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const register = async (req, res, next) => {
    // remove to open to visitors
    restrict(res, next, config.roles.Administrator);

    try {
        // let args = {
        //   model: new UserModel(),
        //   view: res.locals.view,
        //   method: 'POST',
        //   legend: 'UserModel Registration',
        //   actions: {
        //     submit: { value: 'Register', url: '/users/register' },
        //     cancel: { value: 'Cancel', url: '/' },
        //   },
        //   restrict: null,
        // };
        // let { form, validator } = builder.form(args);
        // res.locals.form = form;
        // res.locals.validator = validator;
        res.status(200).json(res.locals);
    } catch (err) {
        next(err);
    }
};

/**
 * Add (i.e. register) new user to database.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const add = async (req, res, next) => {
    // remove to open up to visitors
    // restrict(res, next, config.roles.Administrator);
    let newUser;
    try {
        // validate user input data

        let { email, password, role_id } = req.body;
        newUser = new User({
            email: valid.load(email).isEmail().data,
            password: valid.load(password).isPassword().data,
            role_id: role_id,
        });
        newUser.encrypt();
    } catch (err) {
        next(err);
    }

    // insert user in database
    await newUser
        .register()
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError('register');
            let user_id = result.rows[0].user_id;
            // // send confirmation email to user
            // utils.email.send(user.email, "Verify registration.");
            res.message('Registration was successful!', 'success');
            res.redirect(path.join('/users', user_id));
        })
        .catch((err) => {
            next(err);
        });
};

/**
 * Edit the user's profile data.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const edit = async (req, res, next) => {
    // retrieve user roles
    const { roles } = await userRoleServices.findAll().catch((err) => next(err));

    await userServices
        .findById(res.locals.req_id)
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError('nouser');
            let user = new User(result);
            // add role options to model
            user.setOptions('role', roles);
            // assemble build parameters
            let args = {
                model: user,
                view: res.locals.view,
                method: 'POST',
                legend: 'Update UserModel Profile',
                actions: {
                    submit: { value: 'Update', url: path.join('/users', res.locals.users_id, 'edit') },
                    cancel: { value: 'Cancel', url: '/' },
                },
                restrict: req.session.user || null,
            };
            let { form, validator } = builder.form(args);
            res.locals.form = form;
            res.locals.validator = validator;
            res.render('edit');
        })
        .catch((err) => next(err));
};

/**
 * Update the user's profile data.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const update = async (req, res, next) => {
    let user;
    try {
        // initialize user object
        user = new User(req.body);
    } catch (err) {
        next(err);
    }
    // update user data
    await userServices
        .update(user.getData())
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError('update');
            res.message('Update successful!', 'success');
            res.redirect(path.join('/users', result.rows[0].id));
        })
        .catch((err) => {
            next(err);
        });
};

/**
 * Confirm removal of user.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const confirmRemove = async (req, res, next) => {
    await db
        .findById(req.params.user_id)
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError('nouser');
            // let user = new User(result);
            // let { form, validator } = builder.form(
            //     {
            //         view: res.locals.name,
            //         name: 'Delete',
            //         method: 'POST',
            //         routes: {
            //             submit: path.join('/users', res.locals.req_id, 'delete'),
            //             cancel: '/users',
            //         },
            //     },
            //     user,
            // );
            // res.locals.form = form;
            // res.locals.validator = validator;
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Delete user.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const remove = async (req, res, next) => {
    await db
        .remove('users', req.body.user_id)
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError('nouser');
            res.message('User ${req.body.user_id} successfully deleted.', 'success');
            res.redirect('/users');
        })
        .catch((err) => next(err));
};
