/*!
 * MLP.API.Controllers.Users
 * File: users.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import * as db from '../services/index.services.js';
import valid from '../lib/validate.utils.js';
import { prepare } from '../lib/api.utils.js';
import * as auth from '../services/auth.services.js'

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

    // initialize users database
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
 * @method get
 * @src public
 */
export const list = async (req, res, next) => {
    await db.users
        .getAll()
        .then(data => {
            res.status(200).json(prepare({data: data.rows}));
        })
        .catch(err => next(err));
};

/**
 * Show user's profile data. Only the profile of the current user is
 * accessible, unless the current user has administrator privileges.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method get
 * @src public
 */

export const show = async (req, res, next) => {
    await db.users
        .select(req.params.user_id)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('nouser');
            res.status(200).json({user: data.rows[0] });
        })
        .catch((err) => next(err));
};

/**
 * User sign-in interface.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method get
 * @src public
 */

export const login = async (req, res, next) => {
    try {

        // check if user is currently logged-in
        const isAuth = await auth.check(req);
        console.log('Is authenticated:', isAuth)
        if (isAuth)
            return next(new Error('redundantLogin'));

        // create form schema from user model
        const user = new User();
        res.status(200).json(
            prepare({model: 'users', view: 'login', attributes: user.attributes})
        );
    } catch (err) {
        return next(err);
    }
};

/**
 * Authenticate user credentials.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method post
 * @src public
 */

export const authenticate = async (req, res, next) => {

    // check if user is currently logged-in
    const isAuth = await auth.check(req);
    if (isAuth)
        return next(new Error('redundantLogin'));

    // authenticate submitted user credentials
    // TODO: Implement login rate limiter
    let reqUser, authUser;
    try {
        // validate user credentials
        const { email, password } = req.body;
        reqUser = {
            email: valid.load(email).isEmail().data,
            password: valid.load(password).isPassword().data,
        };
    } catch (err) {
        return next(new Error('invalidLogin'));
    }

    // Confirm user registration
    await db.users
        .selectByEmail(reqUser.email)
        .then(userData => {

            // User not registered
            if (!userData) throw Error('failedLogin');

            // Authenticate user
            authUser = new User(userData);

            const token = auth.authenticate(authUser, reqUser.password)
            if (!token) throw Error('failedLogin');

            // successful login
            res.status(200).json(
                prepare({
                    message: {msg: 'Login successful!', type: 'success'},
                    user: {
                        id: authUser.getValue('user_id'),
                        email: authUser.getValue('email'),
                        token: token
                    }})
            );
        })
        .catch(err => {return next(err)});
};

/**
 * Logout current user from session. Regenerates session as
 * anonymous user when signing out.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method get
 * @src public
 */

export const logout = async (req, res, next) => {
    try {

        // throw error on redundant logout
        if (req.session.user)
            return next(new Error('logoutRedundant'));

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
 * @method get
 * @src public
 */

export const register = async (req, res, next) => {
    try {
        // create form schema from user model
        const user = new User();
        res.status(200).json(
            prepare({model: 'users', view: 'register', attributes: user.attributes})
        );
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
 * @method post
 * @src public
 */

export const create = async (req, res, next) => {
    let newUser;
    try {
        // validate user input data
        let { email, password, role } = req.body;
        newUser = new User({
            email: valid.load(email).isEmail().data,
            password: valid.load(password).isPassword().data,
            role: role,
        });
        auth.encryptUser(newUser);
    } catch (err) {
        next(err);
    }

    // Insert user in database
    await db.users
        .insert(newUser)
        .then(user => {
            if (!user) throw new Error('failedRegistration');

            // send confirmation email to user
            // utils.email.send(user.email, "Verify registration.");

            // successful registration
            res.status(200).json(
                prepare({
                    message: {msg: `Registration successful for user ${user.email}!`, type: 'success'},
                    user: {
                        email: user.email,
                        role: user.role
                    }})
            );
        })
        .catch(err => next(err));
};

/**
 * Edit the user's profile data.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method get
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
 * @method post
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
 * @method get
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
 * @method post
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


/**
 * Authenticate user credentials.
 * TODO: Include JWT signing (http://jwt.io/)
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @method post
 * @src public
 */

export const check = (req, res, next) => {

    // return current user data when session exists (logged-in)
    if (req.session.user != null) {
        const { id, email } = req.session.user;
        return res.status(200).json(
            prepare({
                view: 'dashboard',
                user: req.session.user,
                message: { msg: `User ${email} is logged in.`, type: 'warning' }
            })
        );
    }
    next()
}