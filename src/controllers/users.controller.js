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
import * as auth from '../services/auth.services.js';
import valid from '../lib/validate.utils.js';
import { prepare } from '../lib/api.utils.js';

/**
 create array of sensitive attributes to filter from responses.
*/

const filter = ['password', 'salt_token', 'reset_password_token']

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
 * @param req
 * @param res
 * @param next
 * @method get
 * @src public
 */
export const list = async (req, res, next) => {
    await db.users
        .getAll()
        .then(data => {
            res.status(200).json(
                prepare({
                    view: 'list',
                    model: new User(),
                    data: data
                }));
        })
        .catch(err => next(err));
};

/**
 * Show user's profile data. Only the profile of the current user is
 * accessible, unless the current user has administrator privileges.
 *
 * @param req
 * @param res
 * @param next
 * @method get
 * @src public
 */

export const show = async (req, res, next) => {

    // get requested user ID
    const { user_id } = req.params;

    await db.users
        .select(user_id)
        .then(userData => {

            // User does not exist
            if (!userData) throw Error('noRecord');

            res.status(200).json(prepare({
                    model: new User(userData),
                    view: 'show',
                    filter: filter
            }));
        })
        .catch(err => next(err));
};

/**
 * User sign-in interface.
 *
 * @param req
 * @param res
 * @param {Function} next
 * @method get
 * @src public
 */

export const login = async (req, res, next) => {
    try {

        // check if user is already logged-in
        const isAuth = await auth.check(req);
        if (isAuth)
            return next(new Error('redundantLogin'));

        res.status(200).json(prepare({
            model: new User(),
            view: 'login',
            filter: filter
        }));

    } catch (err) {
        return next(err);
    }
};

/**
 * Authenticate user credentials.
 *
 * @param req
 * @param res
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
        console.log(req.body)
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
 * User registration interface. Note: registration is currently
 * restricted to Administrators, but can be open to visitors by
 * removing restrict().
 *
 * @param req
 * @param res
 * @param next
 * @method get
 * @src public
 */

export const register = async (req, res, next) => {
    try {
        res.status(200).json(prepare({
            model: new User(),
            view: 'register'
        }));
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

        // encrypt user password and generate salt token
        auth.encryptUser(newUser);

    } catch (err) {
        next(err);
    }

    // Insert user record into database
    await db.users
        .insert(newUser)
        .then(userData => {

            // user record could not be inserted
            if (!userData) throw new Error('failedRegistration');

            // send confirmation email to user
            // utils.email.send(user.email, "Verify registration.");

            // successful registration
            res.status(200).json(
                prepare({
                    model: new User(userData),
                    message: {
                        msg: `Registration successful for user ${userData.email}!`,
                        type: 'success'
                    },
                })
            );
        })
        .catch(err => next(err));
};

/**
 * Request model to edit the user's profile data.
 *
 * @param req
 * @param res
 * @param next
 * @method get
 * @src public
 */

export const edit = async (req, res, next) => {

    // retrieve user roles
    const roles = await db.users.getRoles()
        .catch(err => {return next(err)});
    if (!roles) throw new Error();

    // get requested user ID
    const { user_id } = req.params;

    // return edit schema
    await db.users
        .select(user_id)
        .then(userData => {

            // user not found
            if (!userData) throw new Error();

            const user = new User(userData);

            // if admin user, include role options in model
            if (auth.isAuthorized(req, ['administrator', 'super_administrator']))
                user.setOptions('role', roles);

            // return model data
            res.status(200).json(
                prepare({
                    model: user,
                    view: 'edit'
                })
            );
        })
        .catch(err => next(err));
};

/**
 * Update the user's profile data.
 *
 * @param req
 * @param res
 * @param next
 * @method post
 * @src public
 */

export const update = async (req, res, next) => {

    // initialize user data in model
    let user;
    try {
        user = new User(req.body);
    } catch (err) {
        next(err);
    }

    // update user data
    await db.users
        .update(user)
        .then(userData => {

            // user not found
            if (!userData) throw new Error();

            // return model data
            res.status(200).json(
                prepare({
                    model: user,
                    view: 'edit',
                    message: {msg: `User record updated.`, type: 'success'}
                })
            );
        })
        .catch(err => next(err));
};

/**
 * Confirm removal of user.
 *
 * @param req
 * @param res
 * @param {Function} next
 * @method get
 * @src public
 */

export const remove = async (req, res, next) => {

    // get requested user ID
    const { user_id } = req.params;

    // remove user record
    await db.users
        .select(user_id)
        .then(userData => {

            // user not found
            if (!userData) throw new Error();

            // return model data
            res.status(200).json(
                prepare({
                    model: new User(userData),
                    view: 'remove'
                })
            );
        })
        .catch(err => next(err));
};

/**
 * Delete user record.
 *
 * @param req
 * @param res
 * @param next
 * @method post
 * @src public
 */

export const drop = async (req, res, next) => {

    // get requested user ID
    const { user_id } = req.params;

    await db.users
        .remove(user_id)
        .then(userData => {

            // user not found
            if (!userData) throw new Error();

            console.log(userData)

            // return model data
            res.status(200).json(
                prepare({
                    message: {msg: `User ${userData.email} successfully deleted.`, type: 'success'},
                    model: new User(userData),
                    view: 'remove'
                })
            );
        })
        .catch(err => next(err));
};
