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

import * as db from '../services/index.services.js';
import valid from '../lib/validate.utils.js';
import { authenticate as auth, encryptUser } from '../lib/secure.utils.js';

/**
 * Initialize users, roles tables and admin user account.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

let User;

export const init = async (req, res, next) => {

    // assert.equal(typeof (req), Request,
    //     "argument req must be a Request");
    // assert.equal(typeof (res), Response,
    //     "argument req must be a Response");
    // assert.equal(typeof (next), Function,
    //     "argument next must be a callback");

    await db.users
        .init(
            [
                process.env.API_USER,
                process.env.API_EMAIL,
                process.env.API_HASH,
                process.env.API_SALT
            ]
        )
        .then(next())
        .catch((err) => next(err));

    // generate user model
    User = await db.model.create('users')
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
    await db.users
        .getAll()
        .then((data) => {
            res.locals.users = data.rows;
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Show the user's profile data. Only the profile of the current user
 * is accessible, unless the current user has administrator privileges.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const show = async (req, res, next) => {
    await db.users
        .select(req.params.user_id)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('nouser');
            res.status(200).json({ user: data.rows[0] });
        })
        .catch((err) => next(err));
};

/**
 * User sign-in interface.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const login = async (req, res, next) => {
    try {
        if (req.session.user)
            throw new Error('loginRedundant');
        // let args = {
        //   model: new User(),
        //   view: res.locals.view,
        //   method: 'POST',
        //   legend: 'User Sign In',
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
 * Authenticate user credentials.
 * TODO: Include JWT signing (http://jwt.io/)
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const authenticate = async (req, res, next) => {
    let reqUser, authUser;
    try {
        // validate submitted user credentials
        const { email, password } = req.body;
        reqUser = {
            email: valid.load(email).isEmail().data,
            password: valid.load(password).isPassword().data,
        };
    } catch (err) {
        next(new Error('login'));
    }

    // Confirm user is registered
    await db.users
        .selectByEmail(reqUser.email)
        .then((data) => {

            // User email not registered
            if (data.rows.length === 0) throw Error('login');

            // Authenticate user
            authUser = new User(data);
            if (!auth(authUser, reqUser.password)) throw Error('login');

            // Regenerate session when signing in to prevent fixation
            req.session.regenerate(function(err) {
                if (err) throw Error(err);
                // Store user object in the session store to be retrieved
                req.session.user = {
                    id: authUser.getValue('user_id'),
                    email: authUser.getValue('email'),
                };
                res.message('Login successful.', 'success');
                req.session.save(function(err) {
                    if (err) throw Error(err);
                    // session saved
                    res.status(200).json(res.locals);
                });
            });
        })
        .catch((err) => next(err));
};

/**
 * Logout current user from session. Regenerates
 * session as anonymous user when signing out.
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const logout = async (req, res, next) => {
    try {
        if (!req.session.user)
            throw new Error('logoutRedundant');
        req.session.regenerate(function(err) {
            if (err) throw new Error('logout');
            req.session.save(function(err) {
                if (err) throw Error(err);
                res.message('Successfully logged out!', 'success');
                res.status(200).json(res.locals);
            });
        });
    } catch (err) {
        next(err);
    }
};

/**
 * User registration interface. Note: registration is currently
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
    //restrict(res, next, config.roles.Administrator);

    try {
        // let args = {
        //   model: new User(),
        //   view: res.locals.view,
        //   method: 'POST',
        //   legend: 'User Registration',
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

export const create = async (req, res, next) => {
    let newUser;
    try {
        // validate user input data
        let { email, password, role_id } = req.body;
        newUser = new User({
            email: valid.load(email).isEmail().data,
            password: valid.load(password).isPassword().data,
            role_id: role_id,
        });
        encryptUser(newUser);
    } catch (err) {
        next(err);
    }

    // Insert user in database
    await db.users
        .insert(newUser)
        .then((data) => {
            if (data.rows.length === 0)
                throw new Error('register');
            let user_id = data.rows[0].user_id;
            // // send confirmation email to user
            // utils.email.send(user.email, "Verify registration.");
            res.message('Registration was successful!', 'success');
            req.session.save(function(err) {
                res.locals.user_id = user_id;
                if (err) throw Error(err);
                // res.redirect('/');
                res.status(200).json(res.locals);
            });
        })
        .catch((err) => next(err));
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
    const { roles } = await db.roles.getAll().catch((err) => next(err));

    await db.users
        .select(req.params.user_id)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('nouser');
            let user = new User(data);
            // add role options to model
            // user.setOptions('role', roles);
            // // assemble build parameters
            // let args = {
            //     model: user,
            //     view: res.locals.view,
            //     method: 'POST',
            //     legend: 'Update User Profile',
            //     actions: {
            //         submit: { value: 'Update', url: path.join('/users', res.locals.users_id, 'edit') },
            //         cancel: { value: 'Cancel', url: '/' },
            //     },
            //     restrict: req.session.user || null,
            // };
            // let { form, validator } = builder.form(args);
            // res.locals.form = form;
            // res.locals.validator = validator;
            res.status(200).json(res.locals);
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
        user = new User(req.body);
    } catch (err) {
        next(err);
    }
    // update user data
    await db.users
        .update(user)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('update');
            res.locals.user = data.rows[0];
            res.message('Update successful!', 'success');
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Confirm removal of user.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const remove = async (req, res, next) => {
    await db.users
        .select(req.params.user_id)
        .then((data) => {
            if (data.rows.length === 0)
                throw new Error('nouser');
            // let user = new User(data);
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

export const drop = async (req, res, next) => {
    await db.users
        .remove(req.params.user_id)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('nouser');
            res.locals.user_id = data.rows[0].user_id;
            res.message('User ' + res.locals.user_id + ' successfully deleted.', 'success');
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};
