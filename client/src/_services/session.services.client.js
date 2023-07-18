/*!
 * MLE.Client.Services.Session
 * File: session.services.client.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

/**
 * Retrieve node data from session storage.
 *
 * @public
 */

export const getNodes = () => {
    const nodeJSON = sessionStorage.getItem('nodes') || JSON.stringify([]);
    return JSON.parse(nodeJSON);
}

/**
 * Retrieve node data from session storage.
 *
 * @public
 */

export const checkNode = (node) => {
    return getNodes().includes(node);
}

/**
 * Update node data session storage.
 *
 * @public
 * @param {String} node
 */

export const addNode = (node) => {
    const nodes = getNodes().filter(n => n !== node);
    nodes.push(node);
    sessionStorage.setItem('nodes', JSON.stringify(nodes));
}

/**
 * Delete node from node path in session storage.
 *
 * @public
 */

export const removeNode = (node) => {
    let nodes = getNodes();
    sessionStorage.setItem('nodes', JSON.stringify(
        nodes.filter(n => n !== node))
    );
}

/**
 * Delete node path from session storage.
 *
 * @public
 */

export const clearNodes = () => {
    sessionStorage.setItem('nodes', JSON.stringify([]));
}

/**
 * Retrieve messages from session storage.
 *
 * @public
 */

export const getSessionMsg = () => {
    const msgJSON = sessionStorage.getItem('statusMsg') || JSON.stringify('');
    return msgJSON != null ? JSON.parse(msgJSON) : '';
}

/**
 * Add message to session storage.
 *
 * @public
 */

export const setSessionMsg = (msg) => {
    sessionStorage.setItem('statusMsg', JSON.stringify(msg ? msg : ''));
}

/**
 * Pop messages from session storage.
 *
 * @public
 */

export const popSessionMsg = () => {
    // delete messages if status query parameter is set
    const message = getSessionMsg();
    sessionStorage.removeItem('statusMsg');
    return message;
}

/**
 * Get current navigation view.
 *
 * @public
 */

export const getNavView = () => {
    const navView = sessionStorage.getItem('navView') || ''
    return navView ? JSON.parse(navView) : '';
}

/**
 * Set navigation view.
 *
 * @public
 */

export const setNavView = (view) => {
    sessionStorage.setItem('navView', JSON.stringify(view));
}


/**
 * Retrieve all user preferences from session storage.
 *
 * @public
 */

export const getPrefs = () => {
    const prefsJSON = sessionStorage.getItem('prefs') || JSON.stringify({});
    return JSON.parse(prefsJSON);
}

/**
 * Retrieve user preference setting from session storage.
 *
 * @public
 * @param {String} name
 */

export const getPref = (name) => {
    const prefs = getPrefs();
    return prefs.hasOwnProperty(name) ? prefs[name] : null;
}

/**
 * Update user preferences data in session storage.
 *
 * @public
 * @param {String} name
 * @param value
 */

export const setPref = (name, value) => {
    const prefs = getPrefs();
    prefs[name] = value;
    sessionStorage.setItem('prefs', JSON.stringify(prefs));
}

/**
 * Delete user preferences from session storage.
 *
 * @public
 */

export const clearPrefs = () => {
    sessionStorage.setItem('prefs', JSON.stringify([]));
}
