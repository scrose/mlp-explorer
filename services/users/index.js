/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Services.Users
  File:         /services/users/index.js
  ------------------------------------------------------
  User data model (JS Class)
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 31, 2020
  ======================================================
*/

const db = require('../../db')

'use strict';

// find user by ID
module.exports.findById = (queryText) => {
    return (id) => {
        return db.query(queryText, [id]);
    }
}

// find user by email
module.exports.findByEmail = (queryText) => {
    return (email) => {
        return db.query(queryText, [email]);
    }
}

// find user by other field
module.exports.findOne = (queryText) => {
    return (id) => {
        return db.query(queryText, [id]);
    }
}

// list all users (with surveys)
module.exports.findAll = (queryText) => {
    return () => {
        return db.query(queryText, []);
    }
}

// update user data
module.exports.update = (queryText) => {
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

// insert new user
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


// delete user
module.exports.delete = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.user_id,
        ]);
    }
}
