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

import React from "react";

/**
 * Update user data session storage.
 *
 * @public
 * @param userData
 */

export const setUserSession = (userData) => {
    const {id, email, token} = userData;
    sessionStorage.setItem('userId', id);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userToken', token);
}

/**
 * Retrieve user data from session storage.
 *
 * @public
 */

export const getUserSession = () => {

    // load session values
    const id = sessionStorage.getItem('userId') || false;
    const email = sessionStorage.getItem('userEmail') || false;
    const token = sessionStorage.getItem('userToken') || false

    // check if session is empty
    return (id && email && token)
        ? { id: id, email: email, token: token }
        : {};
}

/**
 * Delete user data from session storage.
 *
 * @public
 */

export const removeUserSession = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userToken');
}

export const UserContext = React.createContext(getUserSession());

export function useUserContext() {
    return React.useContext(UserContext);
}
