/*!
 * MLP.Client.Services.Session
 * File: session.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Update user data session storage. Important that default is an
 * empty string.
 *
 * @public
 * @param {Object} userData
 */

export const setSession = (userData) => {
    const { id='', email='', token='' } = userData;
    sessionStorage.setItem('userId', id);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userToken', token);
}

/**
 * Retrieve user data from session storage.
 *
 * @public
 */

export const getSession = () => {
    return {
        id: sessionStorage.getItem('userId') || '',
        email: sessionStorage.getItem('userEmail') || '',
        token: sessionStorage.getItem('userToken') || ''
    };
}

/**
 * Retrieve user data from session storage.
 *
 * @public
 */

export const getSessionToken = () => {
    return sessionStorage.getItem('userToken') || '';
}

/**
 * Delete user data from session storage.
 *
 * @public
 */

export const removeSession = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userToken');
}