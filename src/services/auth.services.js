/*!
 * MLP.API.Services.DB.Model
 * File: db.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import jwt from "jsonwebtoken";
import * as db from './index.services.js';
import * as sessions from './sessions.services.js';
import crypto from 'crypto';
import uid from 'uid-safe';

/**
 * Generate standard UUID.
 *
 * @public
 * @return {String} UUID
 */

export function genUUID() {
    return uid.sync(36);
}

/**
 * Generate Random ID (16 bytes)
 *
 * @public
 * @return {String} Random ID
 */

export function genID() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Encrypt string
 *
 * @public
 * @param {String} str
 * @param {String} salt
 * @return {String} encrypted string
 */

export function encrypt(str, salt) {
    return crypto.pbkdf2Sync(str, salt, 1000, 64, `sha512`).toString(`hex`);
}

/**
 * Encrypt user salt and password
 *
 * @public
 */

export function encryptUser(user) {
    let password = user.getValue('password') || null;
    if (!password) return;

    // generate unique identifier for user (user_id)
    user.setValue('user_id', genUUID());
    // Generate unique hash and salt tokens
    let salt_token = genID();
    let hash_token = encrypt(password, salt_token);
    // Set values in schema
    user.setValue('password', hash_token);
    user.setValue('repeat_password', hash_token);
    user.setValue('salt_token', salt_token);
}

/**
 * Authenticate user password. Returns JWT token on successful
 * authentication of password.
 *
 * @public
 * @param {Object} user data
 * @param {String} password
 * @return {String} JWT token
 */

export function authenticate(user, password) {
    return user.getValue('password') === encrypt(password, user.getValue('salt_token'))
        ? genAccessToken(user.getValue('user_id'))
        : null;
}

/**
 * Verify JWT token in request.
 *
 * @public
 * @return {Promise} result
 * @param req
 * @param res
 * @param next
 */

export const verify = (req, res, next) => {

    let token = req.headers["x-access-token"];
    let secret = process.env.SESSION_SECRET;

    if (!token) return next(new Error('noToken'));

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return next(new Error('noAuth'));
        req.userId = decoded ? decoded.id : null;
        req.token = token;
    });
};

/**
 * Checks if requested user is authenticated.
 *
 * @public
 * @return {Boolean} result
 * @param req
 * @param allowedRoles
 */

export const check = async (req, allowedRoles=[]) => {

    // get JWT token from request headers
    let token = req.headers["x-access-token"];
    let secret = process.env.SESSION_SECRET;

    if (!token) return false;

    return await jwt.verify(token, secret, (err) => {
        return !err;
    });
};

/**
 * Generate JWT access token. Access token has short lifespan.
 *
 * @public
 * @return {String} token
 * @param {String} userId
 */

export const genAccessToken = (userId) => {
    let secret = process.env.ACCESS_TOKEN_SECRET;
    return jwt.sign({ id: userId }, secret, {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_TTL // default: 24 hours
    });
}

/**
 * Generate JWT refresh token. Refresh token has long lifespan.
 *
 * @public
 * @return {String} token
 * @param {String} userId
 */

export const genRefreshToken = (userId) => {
    let secret = process.env.REFRESH_TOKEN_SECRET;
    return jwt.sign({ id: userId }, secret, {
        algorithm: "HS256",
        expiresIn: process.env.REFRESH_TOKEN_TTL // default: 24 hours
    });
}

/**
 * Authorize user access based on permissions set for user role.
 *
 * @param req
 * @param res
 * @param {Function} next
 * @param {Array} allowedRoles
 * @src public
 */

export const authorize = async (req, res, next, allowedRoles) => {

    // authorize all for 'visitor' restrictions
    if ( allowedRoles.includes('visitor') ) {
        return next();
    }

    // verify JWT authorization token
    // let token = req.headers["x-access-token"];
    let token = req.cookies.jwt
    let secret = process.env.SESSION_SECRET;

    // check if token exists
    if (token == null) return next(new Error('noToken'));

    // verify token
    const userId = await jwt.verify(token, secret, (err, decoded) => {
        if (err) return next(new Error('noAuth'));
        return decoded.id;
    });

    // restrict anonymous users
    if ( userId == null ) next(new Error('restricted'));

    // get current user role and check authorization
    req.user = await db.users
        .select(userId)
        .then(user => {

            // user ID not found
            if (!user)
                throw new Error('restricted');

            // deny users with lesser admin privileges
            if ( !allowedRoles.includes(user.role) )
                throw new Error('restricted');

            // return user data
            return {
                // id: user.user_id,
                email: user.email,
                role: user.role,
                token: user.token
            }

        })
        .catch(err => next(err));

    next();
}

/**
 * Check if user has access based on permissions set for user role.
 *
 * @param req
 * @param {Array} allowedRoles
 * @src public
 */

export const isAuthorized = async (req, allowedRoles=[]) => {

    // authorize all for 'visitor' restrictions
    if ( allowedRoles.includes('visitor') ) return true;

    // get current user role
    const { role } = req.user;

    return allowedRoles.includes(role);
}

/**
 * Issue refresh token.
 *
 * @param req
 * @param res
 * @param {Function} next
 * @src public
 */

export const refresh = async (req, res, next) => {

    // get JWT authorization token from cookie
    // let token = req.headers["x-access-token"];
    let token = req.cookies.jwt;

    // check if token exists
    if (token == null)
        return next(new Error('noToken'));

    // use the jwt.verify method to verify the access token
    // throws an error if the token has expired or has a invalid signature
    const userId = await jwt.verify(token, process.env.SESSION_SECRET, (err, decoded) => {
        if (err) return next(new Error('noAuth'));
        return decoded.id;
    });

    //retrieve the refresh token from the users array
    let refreshToken = sessions.select(userId);

    //verify the refresh token
    await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return next(new Error('noAuth'));
        return decoded.id;
    });

    let newToken = jwt.sign(userId, process.env.ACCESS_TOKEN_SECRET,
        {
            algorithm: "HS256",
            expiresIn: process.env.ACCESS_TOKEN_TTL
        })

    res.cookie("jwt", newToken, {secure: true, httpOnly: true})
    res.send()

}
