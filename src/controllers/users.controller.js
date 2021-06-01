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

import * as auth from '../services/auth.services.js';
import valid from '../lib/validate.utils.js';
import { prepare } from '../lib/api.utils.js';
import { getRoleLabels } from '../services/users.services.js';

/**
 * Controller initialization.
 *
 * @src public
 */

let roleLabels = {};

export const init = async () => {
    // get designated role labels
    roleLabels = await getRoleLabels();
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

            // get token value
            const { refresh_token=null, access_token=null } = data || {};

            // send access token to the client inside a cookie
            // TODO: include secure: true on production site
            res.cookie("access_token", access_token, {httpOnly: true, sameSite: 'strict', signed: true});
            res.cookie("refresh_token", refresh_token, {httpOnly: true, sameSite: 'strict', signed: true});

            // return user role label
            const roleLabel = data.roles.length > 0
                ? (
                    roleLabels.hasOwnProperty(data.roles[0])
                        ? roleLabels[data.roles[0]]
                        : 'Administrator'
                )
                : 'Registered';

            // successful login
            res.status(200).json(
                prepare({
                    message: {msg: 'Login successful!', type: 'success'},
                    view: 'login',
                    user: {
                        email: credentials.email,
                        role: data.roles,
                        label: roleLabel
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

    // logout session in Keycloak
    await auth.logout(access_token, refresh_token)
        .then(kcRes => {

            // Keycloak did not properly log out user
            if (kcRes.status !== 204)
                throw Error('logoutFailed');

            // successful session logout
            res.cookie("access_token", access_token, {httpOnly: true, sameSite: 'strict', signed: true, maxAge: 0});
            res.cookie("refresh_token", refresh_token, {httpOnly: true, sameSite: 'strict', signed: true, maxAge: 0});
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

    if (!access_token)
        return res.status(200).json(
            prepare({
                message: {msg: 'No token.', type: 'success'}})
        );

    // authenticate credentials against Keycloak
    await auth.refresh(refresh_token)
        .then(data => {

            // force logout if no token found or session is invalid
            if (!data) {
                // successful session logout
                res.cookie("access_token", '', {httpOnly: true, sameSite: 'strict', signed: true, maxAge: 0});
                res.cookie("refresh_token", '', {httpOnly: true, sameSite: 'strict', signed: true, maxAge: 0});
                return res.status(200).json(
                    prepare({
                        message: {msg: 'Successfully logged out!', type: 'success'}
                    })
                );
            }

            // get token value
            const { access_token=null, refresh_token=null } = data || {};

            // send access token to the client inside a cookie
            // TODO: include secure: true on production site
            res.cookie("access_token", access_token, {httpOnly: true, sameSite: 'strict', signed: true});
            res.cookie("refresh_token", refresh_token, {httpOnly: true, sameSite: 'strict', signed: true});

            // return user role label
            const roleLabel = data.roles.length > 0
                ? (
                    roleLabels.hasOwnProperty(data.roles[0])
                        ? roleLabels[data.roles[0]]
                        : 'Administrator'
                )
                : 'Registered';

            // successful token refresh
            res.status(200).json(
                prepare({
                    message: {msg: 'Token refreshed.', type: 'success'},
                    user: {
                        email: data.email,
                        role: data.roles,
                        label: roleLabel
                    }
                })
            );
        })
        .catch(err => {return next(err)});

};
