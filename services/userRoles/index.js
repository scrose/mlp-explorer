/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Services.UserRoles
  File:         /services/userRoles/index.js
  ------------------------------------------------------
  User roles data model (JS Class)
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

// find all user roles
module.exports.findAll = (queryText) => {
    return () => {
        return db.query(queryText, [])
    }
}

// update user role
module.exports.update = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.name
        ]);
    }
}

// insert new user role
module.exports.insert = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.name
        ]);
    }
}

// delete user role
module.exports.delete = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.role_id,
        ]);
    }
}

