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

const utils = require('../../utilities')
const db = require('../../db')
const crypto = require('crypto')

let modelSchema = {
        model: 'users',
        label: 'User Profile',
        data: {},
        fields: {
            user_id: {
                label: 'ID',
                type: 'hidden',
                render: {
                    edit: {
                        validation: ['isRequired']
                    }
                }
            },
            email: {
                label: 'Email',
                type: 'email',
                render: {
                    register: {
                        validation: ['isRequired', 'isEmail']
                    },
                    login: {
                        validation: ['isRequired', 'isEmail']
                    },
                    edit: {
                        validation: ['isRequired', 'isEmail']
                    }
                }
            },
            role_id: {
                label: 'User Role',
                type: 'select',
                restrict: [3],
                render: {
                    register: {
                        attributes: {
                            type: 'hidden',
                            value: 1
                        }
                    },
                    edit: {
                        attributes: {
                            type: 'select',
                            value: 1
                        },
                        validation: ['isSelected']
                    }
                }
            },
            encrypted_password: {
                label: 'Password',
                type: 'password',
                render: {
                    register: {
                        attributes: {
                            type: 'password'
                        },
                        validation: ['isPassword']
                    },
                    login: {
                        attributes: {
                            type: 'password'
                        },
                        validation: ['isPassword']
                    },
                    edit: {
                        attributes: {
                            type: 'password'
                        },
                        validation: ['isPassword']
                    },
                    // edit: {
                    //     attributes:{
                    //         type:'link',
                    //         url: 'reset_password',
                    //         linkText: 'Reset Password'
                    //     }
                    // }
                }
            },
            repeat_password: {
                label: 'Repeat Password',
                type: 'repeat_password',
                render: {
                    register: {
                        attributes: {
                            repeat: 'encrypted_password'
                        },
                        validation: ['isRepeatPassword']
                    },
                    edit: {
                        attributes: {
                            repeat: 'encrypted_password'
                        },
                        validation: ['isRepeatPassword']
                    }
                }
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
        },
        // get data values set in schema
        getData: function () {
            let filteredData = {}
            Object.entries(this.fields).forEach(([key, field]) => {
                filteredData[key] = field.value;
            });
            return filteredData;
        },
        // set salt and hash the password for a user
        encrypt: function () {
            // Creating a unique salt for a particular user
            let password = this.fields.encrypted_password.value || null;
            if (!password) return;
            this.salt = crypto.randomBytes(16).toString('hex');
            // Hashing user's salt and password with 1000 iterations,
            this.hash = crypto.pbkdf2Sync(password, this.salt,
                1000, 64, `sha512`).toString(`hex`);
            // encrypt password value
            this.fields.encrypted_password.value = this.hash;
            this.fields.repeat_password.value = this.hash;
        },
        authenticate: function (password) {
            console.log('Authenticating username %s', user.email);
            const hash = crypto.pbkdf2Sync(password,
                this.salt, 1000, 64, `sha512`).toString(`hex`);
            return this.hash === hash;
        }
}

let userRolesSchema = {
    model: 'user_roles',
    label: 'User Roles',
    fields: {
        id: {
            label: 'ID',
            type: 'integer',
            render: {
                select: {
                    option: 'name',
                    value: 'id'
                }
            },
        },
        name: {
            label: 'Name',
            type: 'text',
        }
    }
}

// export schemas
exports.userRolesSchema = userRolesSchema;

// set data values in schema
exports.create = function createModel(data) {
    if (data)
        Object.entries(modelSchema.fields).forEach(([key, field]) => {
            field.value = data.hasOwnProperty(key) ? data[key] : null;
        });
    modelSchema.encrypt();
    return modelSchema;
}

// show individual user
exports.findById = (queryText) => {
    return (id) => {
        return db.query(queryText, [id]);
    }
}

// show individual user
exports.findByEmail = (queryText) => {
    return (email) => {
        return db.query(queryText, [email]);
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
            data.encrypted_password,
            data.role_id
        ]);
    }
}

// login user
exports.login = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.email,
            data.encrypted_password,
            data.session
        ]);
    }
}

// insert new user profile
exports.insert = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.email,
            data.encrypted_password,
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