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
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
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
        .init([
                process.env.API_USER,
                process.env.API_EMAIL,
                process.env.API_HASH,
                process.env.API_SALT])
        .catch((err) => next(err));

    // generate user model
    User = await db.model.create('users')
        .catch((err) => next(err));

    next();
};

/**
 * List all registered users.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
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
 * Show user's profile data. Only the profile of the current user is
 * accessible, unless the current user has administrator privileges.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
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
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @src public
 */

export const login = async (req, res, next) => {
    try {
        // redirect to home if user already logged in.
        if (req.session.user) return res.redirect('/');
        res.status(200).json(res.locals);
    } catch (err) {
        return next(err);
    }
};

/**
 * Authenticate user credentials.
 * TODO: Include JWT signing (http://jwt.io/)
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @src public
 */

export const authenticate = async (req, res, next) => {

    // redirect on redundant login
    if (req.session.user) return res.redirect('/');

    let reqUser, authUser;
    try {
        // validate submitted user credentials
        const { email, password } = req.body;
        reqUser = {
            email: valid.load(email).isEmail().data,
            password: valid.load(password).isPassword().data,
        };
    } catch (err) {
        return next(new Error('login'));
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
                    res.status(200).json(res.locals);
                });
            });
        })
        .catch((err) => next(err));
};

/**
 * Logout current user from session. Regenerates session as
 * anonymous user when signing out.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @src public
 */

export const logout = async (req, res, next) => {
    try {
        // redirect home if user already logged out
        if (!req.session.user) res.redirect('/');
        req.session.regenerate(function(err) {
            if (err) throw new Error('logout');
            req.session.save(function(err) {
                if (err) throw Error(err);
                res.message('Successfully logged out!', 'success');
                res.status(200).json(res.locals);
            });
        });
    } catch (err) {
        return next(err);
    }
};

/**
 * User registration interface. Note: registration is currently
 * restricted to Administrators, but can be open to visitors by
 * removing restrict().
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @src public
 */

export const register = async (req, res, next) => {
    try {
        res.status(200).json(res.locals);
    } catch (err) {
        next(err);
    }
};

/**
 * Add (i.e. register) new user to database.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
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
            if (data.rows.length === 0) throw new Error('register');
            let user = data.rows[0];
            // // send confirmation email to user
            // utils.email.send(user.email, "Verify registration.");
            res.message(`Registration successful for user ${user.email}!`, 'success');
            req.session.save(function(err) {
                res.locals.data = {user_id: user.user_id, email: user.email};
                if (err) throw Error(err);
                res.status(200).json(res.locals);
            });
        })
        .catch((err) => next(err));
};

/**
 * Edit the user's profile data.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @src public
 */

export const edit = async (req, res, next) => {
    // retrieve user roles
    const { roles } = await db.roles.getAll().catch((err) => next(err));
    await db.users
        .select(req.params.user_id)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('nouser');
            res.locals.data={user:data.rows[0], roles:roles};
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Update the user's profile data.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
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
            res.locals.data = data.rows[0];
            res.message(`Update successful to user ${res.locals.data.email} profile!`, 'success');
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Confirm removal of user.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @src public
 */

export const remove = async (req, res, next) => {
    await db.users
        .select(req.params.user_id)
        .then((data) => {
            if (data.rows.length === 0)
                throw new Error('nouser');
            res.locals.data = data.rows[0];
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Delete user record.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @src public
 */

export const drop = async (req, res, next) => {
    await db.users
        .remove(req.params.user_id)
        .then((data) => {
            if (data.rows.length === 0)
                throw new Error('nouser');
            res.locals.data = data.rows[0];
            res.message('User ' + res.locals.data.email + ' successfully deleted.', 'success');
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};
