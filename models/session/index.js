/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Models.Users
  File:         models/users/index.js
  ------------------------------------------------------
  Data layer for Users (user profiles)
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 8, 2020
  ======================================================
*/

const db = require('../../db')
const utils = require('../../utilities')

let modelSchema = {
        model: 'sessions',
        label: '',
        data: {},
        fields: {
            user_id: {
                label: 'User ID',
                type: 'string',
                restrict: [4],
            },
            session_id: {
                label: 'User Role',
                type: 'string',
                restrict: [4],
            },
            created_at: {
                label: 'Created at',
                type: 'timestamp',
            },
            updated_at: {
                label: 'Last Modified at',
                type: 'timestamp',
            }
        },
        // get data values set in schema
        getData: function (fieldName) {
            if (fieldName) return (this.fields.hasOwnProperty(fieldName)) ? this.fields[fieldName].value : null;
            let filteredData = {}
            Object.entries(this.fields).forEach(([key, field]) => {
                filteredData[key] = field.value;
            });
            return filteredData;
        }
}


// set data values in schema
exports.create = function createModel(data) {
    if (data)
        Object.entries(modelSchema.fields).forEach(([key, field]) => {
            field.value = data.hasOwnProperty(key) ? data[key] : null;
        });
    return modelSchema;
}

// find session by user ID
exports.findByUserId = (queryText) => {
    return (user_id) => {
        return db.query(queryText, [user_id]);
    }
}

// find session by session ID
exports.findBySessionId = (queryText) => {
    return (session_id) => {
        return db.query(queryText, [session_id]);
    }
}

// retrieve all active sessions
exports.findAll = (queryText) => {
    return () => {
        return db.query(queryText, []);
    }
}

// update user profile
exports.upsert = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.user_id,
            data.session_id
        ]);
    }
}

// close user session (logout)
exports.delete = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.user_id,
            data.session_id
        ]);
    }
}

// insert new user profile
exports.insert = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.user_id,
            data.session_id
        ]);
    }
}