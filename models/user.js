/*!
 * MLP.Core.Models.User
 * File: /models/user.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const Model = require('./base');
const utils = require('../_utilities');

/**
 * Define User data model schema
 *
 * @private
 */
let schema ={
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
};

/**
 * Create User data model. Inherit from Model abstract class.
 *
 * @private
 * @param data
 */

let User = function (data = null) {
};

User.prototype = new Model('users', 'User Profile', data, schema);

/**
 * Encrypt user salt and password
 *
 * @public
 */

Object.defineProperty(User, 'encrypt', function() {
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
});

/**
 * Authenticate user credentials.
 * @public
 * @param {String} password
 */

Object.defineProperty(this, 'authenticate', function ( password ) {
    console.log('Authenticating user %s', this.getValue('email'));
    return this.getValue('password') === utils.secure.encrypt(password, this.getValue('salt_token'));
});


/**
 * Module exports.
 * @public
 */

module.exports = User