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

utils = require('../../utilities')
db = require('../../db')


let modelSchema = {
    model: 'users',
    label: 'User Profile',
    fields: {
        user_id: {
            label: 'ID',
            type: 'integer',
            render: {
                edit: { attributes:{
                    type:'number'
                }}
            },
            validation: ['isRequired']
        },
        email: {
            label: 'Email',
            type: 'email',
            render: {
                register: { attributes:{
                    type:'email'
                }}
            },
            validation: ['isRequired', 'isEmail']
        },
        role_id: {
            label: 'User Role',
            type: 'integer',
            restrict: [3],
            render: {
                register: { attributes:{
                        type:'hidden',
                        value: 1
                    }}
            },
            validation: ['isRequired']
        },
        encrypted_password: {
            label: 'User Password',
            type: 'password',
            render: {
                register: {
                    attributes:{
                        type:'password',
                        class: 'password'
                    }
                }
            },
            validation: ['isPassword']
        },
        repeat_password: {
            label: 'Repeat Password',
            type: 'password',
            render: {
                register: {
                    attributes:{
                        type:'password',
                        class: 'password'
                    }
                }
            },
            validation: ['isRepeatPassword']
        },
        reset_password_token: {
            label: '',
            type: 'string',
            restrict: [3]
        },
        reset_password_sent_at: {
            label: 'Reset Password Sent at',
            type: 'timestamp',
            restrict: [3]
        },
        remember_created_at: {
            label: 'Remember Created at',
            type: 'timestamp',
            restrict: [3]
        },
        sign_in_count: {
            label: 'Sign in Count',
            type: 'integer',
            restrict: [3]
        },
        current_sign_in_at: {
            label: 'Current Sign-in at',
            type: 'timestamp',
            restrict: [3],
        },
        last_sign_in_at: {
            label: 'Last Sign-in at',
            type: 'timestamp',
            restrict: [3],
        },
        created_at: {
            label: 'Created at',
            type: 'timestamp',
        },
        updated_at: {
            label: 'Last Modified at',
            type: 'timestamp',
        }
    }
}

let userRolesSchema = {
    model: 'user_roles',
    label: 'User Roles',
    fields: {
        id: {
            label: 'ID',
            type: 'integer'
        },
        name: {
            label: 'Name',
            type: 'string',
        }
    }
}

// export schemas
exports.schema = modelSchema
exports.userRolesSchema = userRolesSchema

// show individual user
exports.findById = (queryText) => {
    return (id) => {
        return db.query(queryText, [id]);
    }
}

// find individual user by other field
exports.findOne = (queryText) => {
    return (id) => {
        return db.query(queryText, [id]);
    }
}

// list all users (with surveys)
exports.findAll = (queryText) => {
    return () => {
        return db.query(queryText, []);
    }
}

// update user profile
exports.update = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.user_id,
            data.email,
            data.role_id
        ]);
    }
}

// insert new user profile
exports.insert = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.email,
            data.role_id
        ]);
    }
}

// list user roles
exports.findAllRoles = (queryText) => {
    return () => {
        return db.query(queryText, [])
    }
}


// Update stations
// module.exports = {
//     update: (params, callback) => {
//         client.query('BEGIN', err => {
//             if (shouldAbort(err)) return
//             const queryText = 'INSERT INTO users(name) VALUES($1) RETURNING id'
//             client.query(queryText, ['brianc'], (err, res) => {
//                 if (shouldAbort(err)) return
//                 const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
//                 const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
//                 client.query(insertPhotoText, insertPhotoValues, (err, res) => {
//                     if (shouldAbort(err)) return
//                     client.query('COMMIT', err => {
//                         if (err) {
//                             console.error('Error committing transaction', err.stack)
//                         }
//                         done()
//                     })
//                 })
//             })
//         })
//     }
// }
