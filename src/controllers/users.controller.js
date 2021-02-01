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

let User, roles;

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

    // retrieve user roles
    roles = await db.users.getRoles()
        .catch(err => {return next(err)});
    if (!roles) throw new Error();

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

    // create user model, include role options in model
    const user = new User()
    if (roles)
        user.setOptions('role', roles);

    await db.users
        .getAll()
        .then(data => {
            res.status(200).json(
                prepare({
                    view: 'list',
                    model: user,
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
 * User sign-in using email and password.
 *
 * @param req
 * @param res
 * @param {Function} next
 * @method post
 * @src public
 */

export const login = async (req, res, next) => {

    // get access token from request cookie
    const { access_token=null } = req.signedCookies || [];

    let credentials;
    try {
        // check if user is currently logged-in
        const isAuth = await auth.validate(access_token);
        if (isAuth)
            return next(new Error('redundantLogin'));

        // otherwise, validate user credentials
        const { email = '', password = '' } = req.body || {};
        credentials = {
            email: valid.load(email).isEmail().data,
            password: valid.load(password).isPassword().data,
        }
    }
    catch (err) {
        return next(err);
    }

    // authenticate credentials against Keycloak
    await auth.authenticate(credentials)
        .then(data => {
            console.log('Login data:', data);

            // get token value
            const { refresh_token=null, access_token=null } = data || {};

            // send access token to the client inside a cookie
            // TODO: include secure: true on production site
            res.cookie("access_token", access_token, {httpOnly: true, sameSite: 'strict', signed: true});
            res.cookie("refresh_token", refresh_token, {httpOnly: true, sameSite: 'strict', signed: true});

            // successful login
            res.status(200).json(
                prepare({
                    message: {msg: 'Login successful!', type: 'success'},
                    view: 'login',
                    user: {
                        email: credentials.email,
                        role: data.roles,
                        label: data.roles
                    }})
            );
        })
        .catch(err => {return next(err)});

};


/**
 * User sign-out.
 *
 * @param req
 * @param res
 * @param {Function} next
 * @method post
 * @src public
 */

export const logout = async (req, res, next) => {

    // get access token from cookie
    const { access_token=null, refresh_token=null } = req.signedCookies || [];

    console.log('\n\nLogging out!!\n\n')

    // logout session in Keycloak
    await auth.logout(access_token, refresh_token)
        .then(res => {
            console.log('Logout response:', res);

            if (res.status !== 200) {
                return next(new Error('noAuth'));
            }

            // force token cookies to expire
            // TODO: include secure: true on production site
            res.cookie("access_token", null, {httpOnly: true, sameSite: 'strict', signed: true, maxAge: 0});
            res.cookie("refresh_token", null, {httpOnly: true, sameSite: 'strict', signed: true, maxAge: 0});

            // successful token refresh
            res.status(200).json(
                prepare({
                    message: {msg: 'Successfully logged out!', type: 'success'}
                })
            );
        })
        .catch(err => {return next(err)});

};

/**
 * Refresh user token.
 *
 * @param req
 * @param res
 * @param {Function} next
 * @method get
 * @src public
 */

export const refresh = async (req, res, next) => {

    // get access token from cookie
    const { access_token=null, refresh_token=null } = req.signedCookies || [];

    console.log('Refresh token:', refresh_token)

    if (!access_token)
        return res.status(200).json(
            prepare({
                message: {msg: 'No token.', type: 'success'}})
        );

    // authenticate credentials against Keycloak
    await auth.refresh(refresh_token)
        .then(data => {
            console.log('Refresh data:', data);

            // refresh cancelled if no token found
            if (!data) return next(Error('noToken'));

            // get token value
            const { access_token=null, refresh_token=null } = data || {};

            // send access token to the client inside a cookie
            // TODO: include secure: true on production site
            res.cookie("access_token", access_token, {httpOnly: true, sameSite: 'strict', signed: true});
            res.cookie("refresh_token", refresh_token, {httpOnly: true, sameSite: 'strict', signed: true});

            // successful token refresh
            res.status(200).json(
                prepare({
                    message: {msg: 'Token refreshed.', type: 'success'},
                    user: {
                        email: data.email,
                        role: data.roles,
                        label: data.roles
                    }
                })
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

    // retrieve user roles
    const roles = await db.users.getRoles()
        .catch(err => {return next(err)});
    if (!roles) throw new Error();

    // create user model, include role options
    const user = new User();
    user.setOptions('role', roles);

    try {
        res.status(200).json(prepare({
            model: user,
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
        const { email, password, role } = req.body;

        // create new user instance
        newUser = new User({
            email: valid.load(email).isRequired().isEmail().data,
            password: valid.load(password).isRequired().isPassword().data,
            role: valid.load(role).isRequired().data
        });

        // encrypt user password and generate salt token
        auth.encryptUser(newUser);

    } catch (err) {
        console.error(err)
        return next(new Error('invalidData'));
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
