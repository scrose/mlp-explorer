/*!
 * MLP.Client.Helpers.Data
 * File: data.utils.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Capitalize first letter of string.
 *
 * @param {String} str
 * @return {String} capitalized string
 * @public
 */

export const capitalize = (str) => {
    if (typeof str !== 'string') return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Extract username from email address.
 *
 * @param {String} email
 * @return {String} capitalized string
 * @public
 */

export const getEmailUser = (email) => {
    if (typeof email !== 'string') return ''
    return email.replace(/@.*$/,"")
}


