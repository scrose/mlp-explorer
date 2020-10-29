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
        model: 'users',
        label: 'User Profile',
        data: {},
        fields: {
            user_id: {
                label: 'User ID',
                type: 'string',
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
            password: {
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
            salt_token: {
                label: 'Salt Hash',
                type: 'string'
            },
            session_token: {
                label: 'Session Token',
                type: 'string'
            },
            repeat_password: {
                label: 'Repeat Password',
                type: 'repeat_password',
                render: {
                    register: {
                        attributes: {
                            repeat: 'password'
                        },
                        validation: ['isRepeatPassword']
                    },
                    edit: {
                        attributes: {
                            repeat: 'password'
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
        getData: function (fieldName) {
            if (fieldName) return (this.fields.hasOwnProperty(fieldName)) ? this.fields[fieldName].value : null;
            let filteredData = {}
            Object.entries(this.fields).forEach(([key, field]) => {
                filteredData[key] = field.value;
            });
            return filteredData;
        },
        // set salt and hash the password for a user
        encrypt: function () {
            let password = this.fields.password.value || null;
            if (!password) return;
            // generate unique identifier for user (user_id)
            this.unique_id = utils.secure.genUUID();
            // generate a unique salt for the user (salt_token)
            this.salt = utils.secure.genID();
            // Hash user's salt and password
            this.hash = utils.secure.encrypt(password, this.salt);
            // save encrypted password values / salt
            this.fields.user_id.value = this.unique_id;
            this.fields.password.value = this.hash;
            this.fields.repeat_password.value = this.hash;
            this.fields.salt_token.value = this.salt;
            return this;
        },
        authenticate: function (password) {
            console.log('Authenticating user %s', this.fields.email.value);
            return this.fields.password.value === utils.secure.encrypt(password, this.fields.salt_token.value);
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
            data.password,
            data.salt_token,
            data.role_id
        ]);
    }
}

// open user session (login)
exports.insertSession = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.email,
            data.user_id,
            data.session_token
        ]);
    }
}

// close user session (logout)
exports.deleteSession = (queryText) => {
    return (data) => {
        return db.query(queryText, [
            data.email,
            data.user_id
        ]);
    }
}

// insert new user profile
exports.insert = (queryText) => {
    return (data) => {
        console.log(data)
        return db.query(queryText, [
            data.user_id,
            data.email,
            data.password,
            data.salt_token,
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