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
 * Module exports.
 * @public
 */

module.exports = User

/**
 * Define User data model schema
 *
 * @private
 */
let schema ={
    fields: {
        user_id: {
            label: 'User ID',
            type: 'string',
            render: {
                delete: {
                    attributes: {
                        type: 'hidden'
                    }
                },
                edit: {
                    attributes: {
                        type: 'hidden'
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
                    validation: ['isSelected'],
                    restrict: [3]
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
                        type: 'link',
                        linkText: 'Reset Password',
                        url: '#'
                    }
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
};

/**
 * Create User data model. Call base Model class as constructor.
 *
 * @private
 * @param data
 */
function User(data = null) {
    Model.call(this, 'users', 'User Profile', schema, data);
}

/**
 * Inherit methods from Model abstract class.
 */

User.prototype = Object.create(Model.prototype);

/**
 * Encrypt user salt and password
 *
 * @public
 */

utils.obj.defineMethod(User, 'encrypt', function() {
    let password = this.getValue('password') || null;
    if (!password) return;

    // generate unique identifier for user (user_id)
    this.setValue('user_id', utils.secure.genUUID());
    // Generate unique hash and salt tokens
    let salt_token = utils.secure.genID();
    let hash_token = utils.secure.encrypt(password, salt_token);
    // Set values in schema
    this.setValue('password', hash_token);
    this.setValue('repeat_password', hash_token);
    this.setValue('salt_token', salt_token);

    return this;
});

/**
 * Authenticate user credentials.
 * @public
 * @param {String} password
 */

utils.obj.defineMethod(User, 'authenticate', function ( password ) {
    console.log('Authenticating user %s', this.getValue('email'));
    return this.getValue('password') === utils.secure.encrypt(password, this.getValue('salt_token'));
});
