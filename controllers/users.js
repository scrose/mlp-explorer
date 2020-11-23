/*!
 * MLP.Core.Controllers.Users
 * File: /controllers/permissions.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module constants.
 * @private
 */

const modelName = 'users';

/**
 * Module dependencies.
 * @private
 */

const User = require('../models/User');
const LocalError = require('../models/Error');
const userServices = require('../src/services')({ type: modelName });
const userRoleServices = require('../src/services')({ type: 'roles' });
const builder = require('../views/builders');
const utils = require('../src/lib');
const path = require('path');
const config = require('../src/config');
const { restrict } = require('../src/lib/permissions');
// const jwt = require('express-jwt');

/**
 * Set view engine
 */

exports.engine = 'ejs';

/**
 * Preliminary data preparation.
 *
 * @param req
 * @param res
 * @param next
 * @api private
 */

exports.before = async (req, res, next) => {
  // event-specific request parameters
  res.locals.req_id = req.params.hasOwnProperty('users_id') ? req.params.users_id : null;
  next();
};

/**
 * List all users
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */
exports.list = async (req, res, next) => {
  restrict(res, next, 'list');

  await userServices
    .findAll()
    .then((result) => {
      let userList = [];
      result.rows.forEach((data) => {
        let user = new User(data);
        userList.push(user.data);
      });
      res.render('list', { users: userList });
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * User sign-in interface.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.login = (req, res, next) => {
  try {
    let args = {
      model: new User(),
      view: res.locals.view,
      method: 'POST',
      legend: 'User Sign In',
      actions: {
        submit: { value: 'Sign In', url: '/login' },
        cancel: { value: 'Cancel', url: '/' },
      },
      restrict: req.session.user || null,
    };
    let { form, validator } = builder.form(args);
    res.locals.form = form;
    res.locals.validator = validator;
    res.render('login');
  } catch (err) {
    next(err);
  }
};

/**
 * Logout current user from session.
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.logout = async (req, res, next) => {
  try {
    console.log('Logging out:', req.session.user);
    if (!req.session.user) throw new LocalError('logoutRedundant');
    // Regenerate session as anonymous when signing out
    req.session.regenerate(function (err) {
      if (err) throw LocalError(err);
      res.message('Successfully logged out!', 'success');
      req.session.save(function (err) {
        if (err) throw LocalError(err);
        // session saved
        res.redirect('/');
      });
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Authenticate user credentials.
 * TODO: Include JWT signing (http://jwt.io/)
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.authenticate = async (req, res, next) => {
  // validate user credentials
  let reqUser;
  try {
    const { email, password } = req.body;
    reqUser = {
      email: utils.validate(email).isEmail().data,
      password: utils.validate(password).isPassword().data,
    };
  } catch (err) {
    next(err);
  }

  // confirm user exists
  await userServices
    .findByEmail(reqUser.email)
    .then((result) => {
      if (result.rows.length === 0) throw LocalError('loginFailure');

      // wrap requested user data for authentication
      let authUser = new User(result);

      // authenticate user credentials
      if (!authUser.authenticate(reqUser.password)) throw LocalError('login');

      // Regenerate session when signing in to prevent fixation
      req.session.regenerate(function (err) {
        if (err) throw LocalError(err);
        // Store user object in the session store to be retrieved
        req.session.user = {
          id: authUser.getValue('user_id'),
          email: authUser.getValue('email'),
        };
        res.message('Login successful.', 'success');
        req.session.save(function (err) {
          if (err) throw LocalError(err);
          // session saved
          res.redirect('/');
        });
      });
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * User registration interface. Note: registration is currently
 * restricted to Administrators, but can be open to visitors by
 * removing restrict().
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.register = async (req, res, next) => {
  // remove to open to visitors
  restrict(res, next, config.roles.Administrator);

  try {
    let args = {
      model: new User(),
      view: res.locals.view,
      method: 'POST',
      legend: 'User Registration',
      actions: {
        submit: { value: 'Register', url: '/users/register' },
        cancel: { value: 'Cancel', url: '/' },
      },
      restrict: null,
    };
    let { form, validator } = builder.form(args);
    res.locals.form = form;
    res.locals.validator = validator;
    res.render('register');
  } catch (err) {
    next(err);
  }
};

/**
 * Confirm user registration.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.confirm = async (req, res, next) => {
  // remove to open to visitors
  restrict(res, next, config.roles.Administrator);

  let user;
  try {
    // validate user input data
    let { email, password, role_id } = req.body;
    user = new User({
      email: utils.validate(email).isEmail().data,
      password: utils.validate(password).isPassword().data,
      role_id: role_id,
    });
    user.encrypt();
  } catch (err) {
    next(err);
  }

  // insert user in database
  await userServices
    .insert(user.getData())
    .then((result) => {
      if (result.rows.length === 0) throw new LocalError('register');
      let user_id = result.rows[0].user_id;
      // // send confirmation email to user
      // utils.email.send(user.email, "Verify registration.");
      res.message('Registration was successful!', 'success');
      res.redirect(path.join('/users', user_id));
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Show the user's profile data. Only the profile of the current user
 * is accessible, unless the user has administrator privileges.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.show = async (req, res, next) => {
  // restrict to owners and administrators
  restrict(res, next, config.roles.Administrator, res.locals.req_id);

  await userServices
    .findById(res.locals.req_id)
    .then((result) => {
      if (result.rows.length === 0) throw new LocalError('nouser');
      let user = new User(result);
      res.render('show', {
        user: user.getData(),
      });
    })
    .catch((err) => next(err));
};

/**
 * Edit the user's profile data.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.edit = async (req, res, next) => {
  // retrieve user roles
  const { roles } = await userRoleServices.findAll().catch((err) => next(err));

  await userServices
    .findById(res.locals.req_id)
    .then((result) => {
      if (result.rows.length === 0) throw new LocalError('nouser');
      let user = new User(result);
      // add role options to model
      user.setOptions('role', roles);
      // assemble build parameters
      let args = {
        model: user,
        view: res.locals.view,
        method: 'POST',
        legend: 'Update User Profile',
        actions: {
          submit: { value: 'Update', url: path.join('/users', res.locals.users_id, 'edit') },
          cancel: { value: 'Cancel', url: '/' },
        },
        restrict: req.session.user || null,
      };
      let { form, validator } = builder.form(args);
      res.locals.form = form;
      res.locals.validator = validator;
      res.render('edit');
    })
    .catch((err) => next(err));
};

/**
 * Update the user's profile data.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.update = async (req, res, next) => {
  let user;
  try {
    // initialize user object
    user = new User(req.body);
  } catch (err) {
    next(err);
  }
  // update user data
  await userServices
    .update(user.getData())
    .then((result) => {
      if (result.rows.length === 0) throw new LocalError('update');
      res.message('Update successful!', 'success');
      res.redirect(path.join('/users', result.rows[0].id));
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Confirm removal of user.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.remove = async (req, res, next) => {
  await userServices
    .findById(res.locals.req_id)
    .then((result) => {
      if (result.rows.length === 0) throw new LocalError('nouser');
      let user = new User(result);
      let { form, validator } = builder.form(
        {
          view: res.locals.name,
          name: 'Delete',
          method: 'POST',
          routes: {
            submit: path.join('/users', res.locals.req_id, 'delete'),
            cancel: '/users',
          },
        },
        user
      );
      res.locals.form = form;
      res.locals.validator = validator;
      res.render('register');
    })
    .catch((err) => next(err));
};

/**
 * Delete user.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.delete = async (req, res, next) => {
  await userServices
    .delete(req.body)
    .then((result) => {
      if (result.rows.length === 0) throw new LocalError('nouser');
      res.message('User successfully deleted.', 'success');
      res.redirect('/users');
    })
    .catch((err) => next(err));
};
