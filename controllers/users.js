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
const utils = require('../_utilities');
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
    req.view.id = req.params.hasOwnProperty('users_id') ? req.params.users_id : null;
    req.view.model = modelName;
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
                content: req.view,
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
            view: req.view.name,
            method: 'POST',
            legend: 'User Sign In',
            actions: {
                submit: {value: 'Sign In', url: '/login'},
                cancel: {value: 'Cancel', url: '/'},
            },
            restrict: req.session.user || null
        }
        let {form, validator} = builder.form(args);
        req.view.form = form;
        req.view.validator = validator;
        res.render('login', {content: req.view});
    } catch(err) {
        next(err);
    }
};

/**
 * User sign-out interface.
 *
 *
 exports.logout=function(req,res){

  sess=req.session;
  var data = {
    "Data":""
  };
  sess.destroy(function(err) {
    if(err){
      data["Data"] = 'Error destroying session';
      res.json(data);
    }else{
      data["Data"] = 'Session destroy successfully';
      res.json(data);
      //res.redirect("/login");
    }
  });

};
 * @param req
 * @param res
 * @param next
 * @api public
 */

exports.logout = async (req, res, next) => {
    try {
        console.log('Logging out:', req.session.user)
        if (!req.session.user) throw new LocalError("logoutRedundant");
        // Destroy session when signing out
        req.session.destroy(function(err){
            if (err) {
                console.error(err);
                throw new LocalError("logoutFailure");
            }
            res.redirect('/?logout=true');
        });
    }
    catch(err) {
        next(err);
    }
};

/**
 * Authenticate user credentials.
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
            if (result.rows.length === 0) throw LocalError("loginFailure");
            // wrap requested user data for authentication
            let authUser = new User( result );
            // authenticate user credentials
            if ( !authUser.authenticate(reqUser.password) ) throw LocalError("login");
            // TODO: Include JWT signing (http://jwt.io/)
            console.log('Current Session ID:', req.session.id)
            // Regenerate session when signing in to prevent fixation
            req.session.regenerate(function (err){
                if (err) throw LocalError(err);
                // Store user object in the session store to be retrieved
                req.session.user = {
                    id: authUser.getValue('user_id'),
                    email: authUser.getValue('email'),
                    role: authUser.getValue('role_id')
                };
                req.session.messages = {code: 'login', type:'success'};
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
            view: req.view.name,
            method: 'POST',
            legend: 'User Registration',
            actions: {
                submit: {value: 'Register', url: '/users/register'},
                cancel: {value: 'Cancel', url: '/'}
            },
            restrict: null
        }
        let {form, validator} = builder.form(args);
        req.view.form = form;
        req.view.validator = validator;
        res.render('register', {
            content: req.view
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
    await userServices.findById( req.view.id )
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError("nouser");
            let user = new User( result );
            res.render('show', {
                content: req.view,
                user: user.getData()
            });
            res.success('View successful!');
            console.log(req.session.message)
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
    req.view.name = 'edit';
    // retrieve user roles
    const {rows} = await userRoleServices.findAll().catch((err) => next(err));

    await userServices.findById( req.view.id )
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError('nouser');
            let user = new User( result );
            // add role options to model
            user.setOptions('role', rows);
            // assemble build parameters
            let args = {
                model: user,
                view: req.view.name,
                method: 'POST',
                legend: 'Update User Profile',
                actions: {
                    submit: {value: 'Update', url: path.join('/users', req.view.id, 'edit')},
                    cancel: {value: 'Cancel', url: '/'},
                },
                restrict: req.session.user || null
            }
            let {form, validator} = builder.form(args);
            req.view.form = form;
            req.view.validator = validator;
            res.render('edit', {
                content: req.view
            });
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
    await userServices.findById( req.view.id )
        .then((result) => {
            if (result.rows.length === 0) throw new LocalError('nouser');
            let user = new User( result );
            let {form, validator} = builder.form(
                {
                    view: req.view.name,
                    name: 'Delete',
                    method: 'POST',
                    routes: {
                        submit: path.join('/users', req.view.id, 'delete'),
                        cancel: '/users',
                    }
                }, user);
            res.render('register', {
                content: req.view,
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


