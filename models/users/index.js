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
    attributes: {
        model: 'users',
        username: 'email',
        password: 'encrypted_password'
    },
    legend: 'User Profile',
    fields: {
        user_id: {
            hide_if_empty: true,
            label: 'ID',
            attributes: {
                type: 'hidden',
                required: 'required'
            }
        },
        email: {
            label: 'Email',
            attributes: {
                type: 'email',
                maxlength: 255,
                placeholder: '',
                required: 'required'
            },
            validation: ['isRequired', 'isEmail']
        },
        role_id: {
            label: 'User Role',
            restrict: [3],
            attributes: {
                type: 'select',
                maxlength: 255,
            }
        },
        encrypted_password: {
            label: 'User Password',
            text: 'Reset Password',
            attributes: {
                type: 'link',
                href: '/reset_password',
                class: 'form_button',
                required: 'required'
            },
            validation: ['isPassword']
        },
        reset_password_token: {
            label: '',
            restrict: [3],
            attributes: {
                type: 'ignore',
                maxlength: 255,
                placeholder: ''
            }
        },
        reset_password_sent_at: {
            label: 'Reset Password Sent at',
            restrict: [3],
            attributes: {
                type: 'timestamp',
                class: 'datetime'
            }
        },
        remember_created_at: {
            label: 'Remember Created at',
            restrict: [3],
            attributes: {
                type: 'timestamp',
                class: 'datetime'
            }
        },
        sign_in_count: {
            label: 'Sign in Count',
            hide_if_empty: true,
            restrict: [3],
            attributes: {
                type: 'number',
                disabled: true
            }
        },
        current_sign_in_at: {
            label: 'Current Sign-in at',
            hide_if_empty: true,
            restrict: [3],
            attributes: {
                type: 'timestamp',
                class: 'datetime'
            }
        },
        last_sign_in_at: {
            label: 'Last Sign-in at',
            hide_if_empty: true,
            restrict: [3],
            attributes: {
                type: 'timestamp',
                class: 'datetime'
            }
        },
        created_at: {
            label: 'Created at',
            hide_if_empty: true,
            attributes: {
                type: 'timestamp',
                class: 'datetime'
            }
        },
        updated_at: {
            label: 'Last Modified at',
            hide_if_empty: true,
            attributes: {
                type: 'timestamp',
                class: 'datetime'
            }
        }
    }
}

let userRolesSchema = {
    attributes: {
        model: 'user_roles',
        option: {
            id: 'id',
            value: 'name'
        }
    },
    legend: 'User Roles',
    fields: {
        id: {
            label: 'ID',
            attributes: {
                type: 'hidden',
            }
        },
        name: {
            label: 'Name',
            attributes: {
                type: 'text',
            }
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


// register user
exports.register = (queryText) => {
    const timestamp = utils.date.getTimestamp();
    return (data) => {
        const { rows } = db.query(queryText, [
            data.email,
            data.encrypted_password,
            data.sign_in_count,
            current_sign_in_at,
            last_sign_in_at,
            current_sign_in_ip,
            last_sign_in_ip,
            created_at,
            updated_at,
            role
        ]);
        return rows[0];
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
