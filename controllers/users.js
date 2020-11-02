/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Controllers.Users
  File:         /controllers/user.js
  ------------------------------------------------------
  Parses and translates user data into application
  executions and responds.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 2, 2020
  ======================================================
*/

/* global constants */
const model = 'users'

/* imports */
const User = require('../classes/user');
const UserRole = require('../classes/userRole');
const userServices = require('../services')({ type: model });
const userRoleServices = require('../services')({ type: 'userRoles' });
const builder = require('../views/builder');
const utils = require('../_utilities');
const path = require('path');
const {ValidationError} = require('../classes/error')
const jwt = require('express-jwt');

exports.engine = 'ejs';


// ------- preliminary handler -------
exports.before = async (req, res, next) => {
    // event-specific request parameters
    req.view.id = req.params.users_id || null;
    req.view.model = model;
    next();
};

// ------- list all users -------
exports.list = async (req, res, next) => {
    await userServices.findAll()
        .then((result) => {
            let userList = []
            result.rows.forEach((data) => {
                let user = new User( data );
                userList.push(user);
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


// ------- login user -------
exports.login = (req, res, next) => {
    try {
        let user = new User();
        let {form, validator} = builder.forms.create(
            {
                view: 'login',
                name: 'Login',
                method: 'POST',
                routes: {
                    submit: req.url,
                    cancel: '/',
                }
            },
            user);

        res.render('login', {
            content: req.view,
            formSchema: form,
            validatorSchema: validator
        });
    } catch(err) {
        next(err);
    }
};


// ------- logout user -------
exports.logout = async (req, res, next) => {
    try {
        if (!req.session.user) throw new Error();
        // Regenerate session when signing out to prevent fixation
        req.session.regenerate(function(){
            // Store the user's primary key
            // in the session store to be retrieved,
            // or in this case the entire user object
            req.session.user = null;
            res.message({severity:'success', code:'logout'});
            res.redirect('/');
        });
    }
    catch(err) {
        console.log(err)
        next(err);
    }
};


// ------- authenticate user -------
exports.auth = async (req, res, next) => {
    let reqUser
    try {
        reqUser = utils.data.sanitize( req.body );
    }
    catch (err) {
        next(err);
    }
    // confirm user exists
    await userServices.findByEmail( reqUser.email )
        .then((result) => {
            if (result.rows.length === 0) throw new ValidationError("login");
            // wrap requested user data for authentication
            let authUser = new User( result );
            // authenticate user credentials
            if ( !authUser.authenticate(reqUser.password) ) throw new ValidationError("login");
            // TODO: Include JWT signing (http://jwt.io/)
            // Regenerate session when signing in to prevent fixation
            req.session.regenerate(function(err){
                // Store user object in the session store to be retrieved
                req.session.user = {
                    id: authUser.getData('user_id'),
                    email: authUser.getData('email'),
                    role: authUser.getData('role_id')
                };
                req.session.messages = {code: 'login', type:'success'}
                res.redirect('/');
            });
        })
        .catch((err) => {
            next(err);
        });

}



// ------- register new user -------
exports.register = async (req, res, next) => {
    // build registration form + validator schemas
    let user = new User();
    let {form, validator} = builder.forms.create(
        {
            view: 'register',
            name: 'Register',
            method: 'POST',
            routes: {
                submit: '/users/register',
                cancel: '/',
            }
        }, user);
    try {
        res.render('register', {
            content: req.view,
            formSchema: form,
            validatorSchema: validator
        });
    } catch(err) {
        next(err)
    }
};


// ------- confirm user registration -------
exports.confirm = async (req, res, next) => {
    // create user from schema
    let user;
    try {
        user = new User( req.body );
        user.encrypt();
    } catch (err) {
        next(err);
    }
    // insert user record in database
    await userServices.insert( user.data )
        .then((result) => {
            if (result.rows.length === 0) throw new ValidationError("register");
            // let userEmail = result.rows[0].email;
            // // send confirmation email to user
            // utils.email.send(userEmail, "Verify registration.");
            res.success('Registration successful!');
            res.redirect('/')
        })
        .catch((err) => {
            next(err)
        })
}


// ------- show user profile -------
exports.show = async (req, res, next) => {
    await userServices.findById( req.view.id )
        .then((result) => {
            if (result.rows.length === 0) throw new ValidationError("nouser");
            let user = new User( result );
            res.render('show', {
                content: req.view,
                user: user.data
            });
            res.success('View successful!');
            console.log(req.session.message)
        })
        .catch((err) => {
            next(err);
        });
};


// ------- edit user profile -------
exports.edit = async (req, res, next) => {
    // retrieve user roles
    let userRole = new UserRole();
    const roles = await userRoleServices.findAll().catch((err) => next(err));
    // build widget for selection of user roles
    let widget = {'role_id': builder.forms.select('role_id', userRole.schema, roles.rows)}

    await userServices.findById( req.view.id )
        .then((result) => {
            if (result.rows.length === 0) throw new ValidationError('nouser');
            let user = new User( result );
            let {form, validator} = builder.forms.create(
                {
                    view: 'edit',
                    name: 'Edit',
                    method: 'POST',
                    routes: {
                        submit: path.join('/users', req.view.id, 'edit'),
                        cancel: '/users',
                    }
                },
                user,
                widget
            );
            res.render('edit', {
                content: req.view,
                formSchema: form,
                validatorSchema: validator
            });
        })
        .catch((err) => next(err));
}


// ------- update user profile -------
exports.update = async (req, res, next) => {
    await userServices.update( req.body )
        .then((result) => {
            if (result.rows.length === 0) throw new ValidationError('nouser');
            res.success('Update successful!');
            console.log('Redirecting to %s', path.join('users', req.params.users_id, 'edit'))
            res.redirect(path.join('/users', req.params.users_id, 'edit'))
        })
        .catch((err) => next(err));
}



// ------- confirm deletion of user account -------
exports.remove = async (req, res, next) => {
    await userServices.findById( req.view.id )
        .then((result) => {
            if (result.rows.length === 0) throw new ValidationError('nouser');
            let user = new User( result );
            let {form, validator} = builder.forms.create(
                {
                    view: 'delete',
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

// ------- delete user account -------
exports.delete = async (req, res, next) => {
    await userServices.delete( req.body )
        .then((result) => {
            if (result.rows.length === 0) throw new ValidationError('nouser');
            res.success("User successfully deleted.");
            res.redirect('/users')
        })
        .catch((err) => next(err));
}


