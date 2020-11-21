/*!
 * MLP.Core.Controllers.Users
 * File: /controllers/user.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module constants.
 * @private
 */
const modelName = 'users'

/**
 * Module dependencies.
 * @private
 */

const User = require('../models/user');
const LocalError = require('../models/error')
const userServices = require('../services')({ type: modelName });
const userRoleServices = require('../services')({ type: 'userRoles' });
const builder = require('../views/builders');
const utils = require('../lib');
const path = require('path');
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
    res.locals.users_id = req.params.hasOwnProperty('users_id') ? req.params.users_id : null;
    res.locals.modelName = modelName;
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
    await userServices.findAll()
        .then((result) => {
            let userList = []
            result.rows.forEach((data) => {
                let user = new User(data);
                userList.push(user.data);
            });
            res.render('list', {
                content: res.locals,
                users: userList
            });
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
                submit: {value: 'Sign In', url: '/login'},
                cancel: {value: 'Cancel', url: '/'},
            },
            restrict: req.session.user || null
        }
        let {form, validator} = builder.form(args);
        res.locals.form = form;
        res.locals.validator = validator;
        res.render('login');
    } catch(err) {
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
        console.log('Logging out:', req.session.user)
        if (!req.session.user)
            throw new LocalError("logoutRedundant");
        // Regenerate session as anonymous when signing out
        req.session.regenerate(function (err){
            if (err) throw LocalError(err);
            req.session.user = {
                id: 'anonymous',
                email: null,
                role: 0
            };
            res.message({type:'success', text: 'You have been logged out.'});
            res.redirect('/')
        });
    }
    catch(err) {
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
    let reqUser
    try {
        const { email, password } = req.body
        reqUser = {
            email: utils.validate(email).isEmail().data,
            password: utils.validate(password).isPassword().data
        };
    }
    catch (err) {
        next(err);
    }

    // confirm user exists
    await userServices.findByEmail( reqUser.email )
        .then((result) => {

            if (result.rows.length === 0)
                throw LocalError("loginFailure");

            // wrap requested user data for authentication
            let authUser = new User( result );

            // authenticate user credentials
            if ( !authUser.authenticate(reqUser.password) )
                throw LocalError("login");

            // Regenerate session when signing in to prevent fixation
            req.session.regenerate(function (err){
                if (err) throw LocalError(err);

                // Store user object in the session store to be retrieved
                req.session.user = {
                    id: authUser.getValue('user_id'),
                    email: authUser.getValue('email'),
                    role: authUser.getValue('role_id')
                };

                res.message('Login successful.', 'success');
                res.redirect('/')
            });
        })
        .catch((err) => {
            next(err);
        });

}

/**
 * User registration interface.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.register = async (req, res, next) => {
    try {
        let args = {
            model: new User(),
            view: res.locals.view,
            method: 'POST',
            legend: 'User Registration',
            actions: {
                submit: {value: 'Register', url: '/users/register'},
                cancel: {value: 'Cancel', url: '/'}
            },
            restrict: null
        }
        let {form, validator} = builder.form(args);
        res.locals.form = form;
        res.locals.validator = validator;
        res.render('register', {
            content: res.locals
        });
    } catch(err) {
        next(err)
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
    let user;
    try {
        // validate user input data
        let {email, password, role_id} = req.body
        user = new User( {
            email: utils.validate(email).isEmail().data,
            password: utils.validate(password).isPassword().data,
            role_id: role_id
        } );
        user.encrypt();
    } catch (err) {
        next(err);
    }

    // insert user in database
    await userServices.insert( user.getData() )
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError("register");
            // let userEmail = result.rows[0].email;
            // // send confirmation email to user
            // utils.email.send(userEmail, "Verify registration.");
            res.message({type: 'success', text: 'Registration successful!'});
            res.redirect('/')
        })
        .catch((err) => {
            next(err)
        })
}

/**
 * Show the user's profile data.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.show = async (req, res, next) => {
    await userServices.findById( res.locals.users_id )
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError("nouser");
            let user = new User( result );
            res.render('show', {
                user: user.getData()
            });
        })
        .catch((err) => {
            next(err);
        });
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
    const {roles} = await userRoleServices.findAll().catch((err) => next(err));

    await userServices.findById( res.locals.users_id )
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError('nouser');
            let user = new User( result );
            // add role options to model
            user.setOptions('role', roles);
            // assemble build parameters
            let args = {
                model: user,
                view: res.locals.view,
                method: 'POST',
                legend: 'Update User Profile',
                actions: {
                    submit: {value: 'Update', url: path.join('/users', res.locals.users_id, 'edit')},
                    cancel: {value: 'Cancel', url: '/'},
                },
                restrict: req.session.user || null
            }
            let {form, validator} = builder.form(args);
            res.locals.form = form;
            res.locals.validator = validator;
            res.render('edit');
        })
        .catch((err) => next(err));
}

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
        user = new User( req.body );
    } catch (err) {
        next(err);
    }
    // update user data
    await userServices.update( user.getData() )
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError("update");
            res.success('Update successful!');
            res.redirect('/')
        })
        .catch((err) => {
            next(err)
        })

}

/**
 * Confirm removal of user.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.remove = async (req, res, next) => {
    await userServices.findById( res.locals.id )
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError('nouser');
            let user = new User( result );
            let {form, validator} = builder.form(
                {
                    view: res.locals.name,
                    name: 'Delete',
                    method: 'POST',
                    routes: {
                        submit: path.join('/users', res.locals.id, 'delete'),
                        cancel: '/users',
                    }
                }, user);
            res.render('register', {
                content: res.locals,
                formSchema: form,
                validatorSchema: validator
            });
        })
        .catch((err) => next(err));
}

/**
 * Delete user.
 *
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.delete = async (req, res, next) => {
    await userServices.delete( req.body )
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError('nouser');
            res.success("User successfully deleted.");
            res.redirect('/users')
        })
        .catch((err) => next(err));
}


