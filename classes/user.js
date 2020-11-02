/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Classes.User
  File:         /classes/user.js
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

'use strict';

const Model = require('./model')
const utils = require('../_utilities')

class User extends Model {
    constructor (...params) {
        // Pass Model arguments
        super(...params)

        this.name = 'users';
        this.label = 'User Profile';
        this.schema = {
            user_id: {
                label: 'User ID',
                type: 'string',
                render: {
                    delete: {
                        attributes: {
                            type: 'hidden',
                            value: 1
                        }
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
                    },
                    delete: {
                        attributes: {
                            type: 'textNode'
                        }
                    }
                }
            },
            role_id: {
                label: 'User Role ID',
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
            role: {
                label: 'User Role',
                type: 'string',
                restrict: [3],
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
                    }
                }
            },
            salt_token: {
                label: 'Salt Hash',
                type: 'password',
                restrict: [3]
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
            reset_password_expires: {
                label: 'Reset Password Sent at',
                type: 'timestamp',
                restrict: [3]
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
        this.setData(this.inputData);
    }

    // encrypt salt and password for a user
    encrypt () {
        let password = this.getValue('password') || null;
        if (!password) return;

        // generate unique identifier for user (user_id)
        this.setValue('user_id', utils.secure.genUUID());
        // Hash user password
        this.hash = utils.secure.encrypt(password, this.salt);
        this.setValue('password', this.hash);
        this.setValue('repeat_password', this.hash);
        // generate a unique salt for the user (salt_token)
        this.setValue('salt_token', utils.secure.genID());

        return this;
    }

    // authenticate user
    authenticate ( password ) {
        console.log('Authenticating user %s', this.fields.email.value);
        return this.fields.password.value === utils.secure.encrypt(password, this.fields.salt_token.value);
    }
}

// export class
module.exports = User