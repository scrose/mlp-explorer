/*!
 * MLP.Core.Services.Users
 * File: /services/users/index.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const db = require('../../db')

/**
 * Find user by ID.
 *
 * @public
 * @param {String} queryText
 */

module.exports.findById = (queryText) => {
    return (id) => {
        return db.query(queryText, [id]);
    }
}

/**
 * Find user by email.
 *
 * @public
 * @param {String} queryText
 */

module.exports.findByEmail = (queryText) => {
    return (email) => {
        return db.query(queryText, [email]);
    }
}

/**
 * Find user by specified field.
 *
 * @public
 * @param {String} queryText
 */

module.exports.findOne = (queryText) => {
    return (field) => {
        return db.query(queryText, [field]);
    }
}

/**
 * List all users (with surveys).
 *
 * @public
 * @param {String} queryText
 */

module.exports.findAll = (queryText) => {
    return () => {
        return db.query(queryText, []);
    }
}

/**
 * Update user data.
 *
 * @public
 * @param {String} queryText
 */

module.exports.update = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.user_id,
            data.email,
            data.role_id
        ]);
    }
}

/**
 * Insert new user.
 *
 * @public
 * @param {String} queryText
 */

module.exports.insert = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.user_id,
            data.email,
            data.password,
            data.salt_token,
            data.role_id
        ]);
    }
}


/**
 * Delete user.
 *
 * @public
 * @param {String} queryText
 */

module.exports.delete = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.user_id,
        ]);
    }
}
