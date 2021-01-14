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

export const setSession = (userData) => {
    if (userData == null) return;
    const {id='', email='', token=''} = userData;
    console.log(userData)
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

    // load session values
    const id = sessionStorage.getItem('userId') || '';
    const email = sessionStorage.getItem('userEmail') || '';
    const token = sessionStorage.getItem('userToken') || '';

    // check if session is empty
    return { id: id, email: email, token: token };
}

/**
 * Retrieve user JWT token from session storage.
 *
 * @public
 */

export const getSessionToken = () => {

    // load session values
    return sessionStorage.getItem('userToken') || null;

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