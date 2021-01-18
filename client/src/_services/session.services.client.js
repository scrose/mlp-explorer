/*!
 * MLP.Client.Services.Session
 * File: session.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */


import { getQuery } from '../_utils/paths.utils.client';

/**
 * Retrieve user data from session storage.
 *
 * @public
 */

export const getSession = () => {
    const id = sessionStorage.getItem('userId') || ''
    const email = sessionStorage.getItem('userEmail') || ''
    const role = sessionStorage.getItem('userRole') || ''
    const label = sessionStorage.getItem('userRoleLabel') || ''
    const token = sessionStorage.getItem('userToken') || ''

    console.log({id: id, email: email, token: token})

    return id && email && role && token
        ? {id: id, email: email, role: role, token: token, label: label}
        : null;
}

/**
 * Update user data session storage. Important that default is an
 * empty string.
 *
 * @public
 * @param {Object} userData
 */

export const setSession = (userData) => {
    const { id='', email='', role='', token='', label=''} = userData || {};
    sessionStorage.setItem('userId', id);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('userRoleLabel', label);
    sessionStorage.setItem('userToken', token);
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

export const clearSession = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userRoleLabel');
    sessionStorage.removeItem('userToken');
}

/**
 * Retrieve messages from session storage.
 *
 * @public
 */

export const getMsg = () => {
    const msgJSON = sessionStorage.getItem('statusMsg') || ''
    return msgJSON ? JSON.parse(msgJSON) : [];
}

/**
 * Add message to session storage.
 *
 * @public
 */

export const addMsg = (msg) => {
    const messages = getMsg();
    messages.push(msg);
    sessionStorage.setItem('statusMsg', JSON.stringify(messages || []));
}

/**
 * Pop messages from session storage.
 *
 * @public
 */

export const popMsg = () => {
    // delete messages if status query parameter is set
    const messages = getMsg();
    sessionStorage.removeItem('statusMsg');
    return messages;
}