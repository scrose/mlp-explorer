/*!
 * MLP.API.Models.Schemas.User
 * File: users.schema.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Define User data model schema
 *
 * @private
 */

export default {
  name: 'users',
  label: 'User Profile',
  attributes: {
    user_id: {
      label: 'User ID',
      type: 'string',
      render: {
        delete: {
          attributes: {
            type: 'hidden',
          },
        },
        edit: {
          attributes: {
            type: 'hidden',
          },
        },
      },
    },
    email: {
      label: 'Email',
      type: 'email',
      render: {
        register: {
          validation: ['isRequired', 'isEmail'],
        },
        login: {
          validation: ['isRequired', 'isEmail'],
        },
        edit: {
          validation: ['isRequired', 'isEmail'],
        },
        delete: {
          attributes: {
            type: 'textNode',
          },
        },
      },
    },
    role: {
      label: 'User Role ID',
      type: 'select',
      render: {
        register: {
          attributes: {
            type: 'hidden',
            value: 1,
          },
        },
        edit: {
          attributes: {
            type: 'select',
            value: 1,
          },
          validation: ['isSelected'],
          restrict: [3],
        },
      },
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
            type: 'password',
          },
          validation: ['isPassword'],
        },
        login: {
          attributes: {
            type: 'password',
          },
          validation: ['isPassword'],
        },
        edit: {
          attributes: {
            type: 'link',
            linkText: 'Reset Password',
            url: '#',
          },
        },
      },
    },
    salt_token: {
      label: 'Salt Hash',
      type: 'password',
      restrict: [3],
    },
    repeat_password: {
      label: 'Repeat Password',
      type: 'password',
      render: {
        register: {
          attributes: {
            repeat: 'password',
          },
          validation: ['isRepeatPassword'],
        },
      },
    },
    reset_password_token: {
      label: '',
      type: 'string',
      restrict: [3],
    },
    reset_password_expires: {
      label: 'Reset Password Sent at',
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
    },
  },
};
