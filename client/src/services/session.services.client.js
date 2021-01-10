/*!
 * MLP.Client.Services.Session
 * File: session.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Initialize user data session storage.
 *
 * @public
 */

export const initUserSessionData = () => {
    sessionStorage.setItem('userID', '');
    sessionStorage.setItem('userEmail', '');
}

/**
 * Update user data session storage.
 *
 * @public
 * @param userData
 */

export const setUserSession = (userData) => {
    const {id, email} = userData;
    sessionStorage.setItem('userID', id);
    sessionStorage.setItem('userEmail', email);
}

/**
 * Retrieve user data from session storage.
 *
 * @public
 */

export const getUserSession = () => {
    return {
        id: sessionStorage.getItem('userID') || '',
        email: sessionStorage.getItem('userEmail') || ''
    }
}