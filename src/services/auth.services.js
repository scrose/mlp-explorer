/*!
 * MLP.API.Services.Authenticate
 * File: auth.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';


/**
 * Settings
 * TODO: convert to environment variables.
 * @private
 */

const settings = {
    grantType: 'password',
    clientId: "nodejs-microservice",
    realm: "MLP-Explorer",
    serverURL: "http://localhost:8080/auth",
    ssl: "external",
    resource: "nodejs-microservice",
    bearerOnly: true,
    // clientSecret: "50192a2b-b36e-4b6e-9f2c-5df3a0a70864"
    clientSecret: "5b01ce26-d23b-4c2d-9371-a7be962f23f6"
}

/**
 * Compose request urls (KeyCloak endpoints)
 *
 * @public
 */

const kcBaseURL = `${settings.serverURL}/realms/${settings.realm}/protocol/openid-connect`
const kcTokenURL = `${kcBaseURL}/token`;
const kcInfoURL = `${kcBaseURL}/userinfo`;
const kcLogoutURL = `${kcBaseURL}/logout`;

/**
 * Compose authentication request.
 *
 * @public
 */

export function getOpts(payload=null, method='POST') {

    // compose request headers/options
    const opts = {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin', // to include cookie data
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    };

    // add payload (if exists)
    if (payload) {
        // request access token
        opts.body = Object.keys(payload)
            .map(key => {
                const encodedKey = encodeURIComponent(key);
                const encodedValue = encodeURIComponent(payload[key]);
                return `${encodedKey}=${encodedValue}`;
            })
            .join("&");
    }

    return opts;
}

/**
 * Authenticate user password. Returns JSON web token on successful
 * authentication of password.
 *
 * @public
 * @return {String} JSON web token
 * @param {Object} user credentials
 */

export const authenticate = async ({email:email, password:password}) => {

    // Prepare credentials for openid-connect token request
    // ref: http://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint
    const payload = {
        username: email,
        password: password,
        grant_type: settings.grantType,
        client_secret: settings.clientSecret,
        client_id: settings.clientId
    };

    // send request to API
    let data = await fetch(kcTokenURL, getOpts(payload))
        .then(response => response.json())
        .then(data => {
            return data
        })
        .catch(err => {
            console.error('KeyCloak error:', err)
        });

    // decode KeyCloak JWT token
    const { access_token='' } = data || {};
    const decoded = jwt.decode(access_token);

    // append user roles to fetched data
    data.roles = decoded.resource_access[settings.clientId].roles;

    return data;
}


/**
 * Refresh access token from KeyCloak.
 *
 * @public
 * @return {String} JSON web token
 * @param access_token
 * @param refresh_token
 */

export const logout = async (access_token, refresh_token) => {

    // stop refresh if no token found
    if (!access_token) return null;

    const payload = {
        client_secret: settings.clientSecret,
        client_id: settings.clientId,
        refresh_token: refresh_token
    };

    // request options for logout (KeyCloak API)
    const opts = getOpts(payload, 'POST');

    // send logout request to KeyCloak endpoint
    return await fetch(kcLogoutURL, opts);
}

/**
 * Validate access token in session cookie with KeyCloak server.
 *
 * @public
 * @return {String} JSON web token
 * @param token
 */

export const validate = async (token) => {

    // stop verification if no token found
    if (!token) return null;

    // request options for logout (KeyCloak API)
    const opts = getOpts(null, 'GET');
    opts.headers.authorization = token;

    // send a request to the userinfo endpoint on keycloak to
    // validate access token
    let res = await fetch(kcInfoURL, opts)
        .then(response => {
            return response;
        })

}

/**
 * Validate access token in session cookie with KeyCloak server.
 *
 * @public
 * @return {String} JSON web token
 * @param token
 */

export const refresh = async (token) => {

    // stop refresh if no token found
    if (!token) return null;

    const payload = {
        grant_type: 'refresh_token',
        client_secret: settings.clientSecret,
        client_id: settings.clientId,
        refresh_token: token
    };

    // request options for refresh (KeyCloak API)
    const opts = getOpts(payload, 'POST');

    // refresh token via KeyCloak endpoint
    let data = await fetch(kcTokenURL, opts)
        .then(res => {

            // token is invalid or session is not active
            if (!res || res.status !== 200)
                throw new Error('Refresh failed');

            return res

        })
        .then(res => res.json())
        .catch(err => {
            console.error('KeyCloak error:', err)
        });

    // extract user data if response valid
    if (data) {

        // decode KeyCloak JWT token
        const { access_token = '' } = data || {};
        const decoded = jwt.decode(access_token);

        // append user email, roles to fetched data
        data.email = decoded.email;
        data.roles = decoded.resource_access[settings.clientId].roles;
    }

    return data;

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

    // get access token from cookie
    const { access_token=null } = req.signedCookies || [];

    // check if token exists
    if (!access_token) return next(new Error('noToken'));

    // verify token
    const decoded = jwt.decode(access_token);

    // reject invalid user data
    if (!decoded) next(new Error('restricted'));

    // get current user role and check authorization
    const {roles=[]} = decoded.resource_access[settings.clientId];

    // deny users with lesser admin privileges
    // i.e. check if any user roles are allowed.
    if ( !allowedRoles.some(role => roles.includes(role)) )
        throw new Error('restricted');

    // compose user data
    req.user = {
        email: decoded.email,
        role: roles,
        label: roles
    }

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
