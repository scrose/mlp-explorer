/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Contollers.Users
  File:         /controllers/users.js
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
const modelName = 'users'

/* initialize imports */
const utils = require('../utilities');
const path = require('path');
const users = require('../models')({ type: modelName });
const builder = require('../views/builder');
let crypto = require('crypto');

exports.engine = 'ejs';


/*
------------------------------------------------------
  Controller Handlers
------------------------------------------------------
*/

// preliminary handler
exports.before = async (req, res, next) => {
    // event-specific request parameters
    req.view.id = req.params.users_id || null;
    req.view.modelName = modelName;
    next();
};


// ------- list all users -------
exports.list = async (req, res, next) => {
    await users.findAll()
        .then((result) => {
            if (!result) throw new Error();
            const userList = utils.data.reformat( result.rows, users.create() );
            res.render('list', {
                content: req.view,
                users: userList
            });
            res.cleanup();
        })
        .catch((err) => {
            res.message(err);
            next();
        });
};


// ------- register new user -------
exports.register = async (req, res, next) => {
    // build registration form + validator schemas
    let {form, validator} = builder.forms.create(
        {
            view: 'register',
            name: 'Register',
            method: 'POST',
            routes: {
                submit: '/users/insert',
                cancel: '/',
            }
        }, users.create());
    try {
        res.render('register', {
            content: req.view,
            formSchema: form,
            validatorSchema: validator
        });
        res.cleanup();
    } catch(err) {
        res.message(err);
        res.redirect('/');
    }
};


// ------- insert user into db -------
exports.insert = async (req, res, next) => {
    let newUser = users.create( req.body );
    console.log(newUser)
    await users.insert( newUser.getData() )
        .then((result) => {
            if (result.rows.length === 0) throw new Error();
            // let userEmail = result.rows[0].email;
            // // send confirmation email to user
            // utils.email.send(userEmail, "Verify registration.");
            res.message({severity:'success', code:'register'});
        })
        .catch((err) => {
            res.message(err);
        })
        .finally(() => {
            res.redirect('/')
        });
}



// ------- login user -------
exports.login = (req, res, next) => {
    try {
        let {form, validator} = builder.forms.create(
            {
                view: 'login',
                name: 'Login',
                method: 'POST',
                routes: {
                    submit: req.url,
                    cancel: '/',
                    success: '/'
                }
            },
            users.schema);

        res.render('login', {
            content: req.view,
            formSchema: form,
            validatorSchema: validator
        });
        res.cleanup();
    } catch(err) {
        res.message(err);
        res.redirect('/');
    }
};

// ------- logout user -------
exports.logout = async (req, res, next) => {
    await users.logout( req.user )
        .then((user) => {
            // Regenerate session when signing out to prevent fixation
            req.session.regenerate(function(){
                // Store the user's primary key
                // in the session store to be retrieved,
                // or in this case the entire user object
                req.session.user = null;
                res.message({severity:'success', code:'logout'});
                res.redirect('/');
            });
        })
        .catch((err) => {
            res.message({severity:'error', code:'logout'});
            res.redirect('/login');
        });
};


// ------- authenticate user -------
exports.auth = async (req, res, next) => {
    await users.login( req.body )
        .then((user) => {

            if (!authenticate(req.body.email, req.body.encrypted_password, user.rows[0]) ) {
                throw new Error();
            }
            // Regenerate session when signing in to prevent fixation
            req.session.regenerate(function(){
                // Store the user's primary key
                // in the session store to be retrieved,
                // or in this case the entire user object
                req.session.user = user.rows[0];
                res.message({severity:'success', code:'login'});
                res.redirect('/');
            });
        })
        .catch((err) => {
            res.message({severity:'error', code:'login'});
            res.redirect('/login');
        });
}

// ------- show user profile -------
exports.show = async (req, res, next) => {
    await users.findById(req.view.id)
        .then((result) => {
            if (!result) throw new Error('User not found.');
            res.render('show', {
                messages: req.session.messages || [],
                content: req.view,
                tools: utils,
                breadcrumb_menu: req.breadcrumbs,
                user: result.rows[0]
            });
            res.cleanup();
        })
        .catch((err) => {
            res.message(err);
            res.redirect('/users');
        });
};


// ------- edit user profile -------
exports.edit = async (req, res, next) => {
    const successPath = '/';
    const failPath = '/';
    const formView = 'edit';

    // retrieve user roles
    const roles = await users.findAllRoles();
    let rolesSelect = await forms.select('role_id', users.userRolesSchema, roles.rows);
    let widget = {'role_id': rolesSelect}

    // render edit form
    await users.findById(req.view.id)
        .then((result) => {
            if (!result.rows) throw new Error('User not found.');
            console.log(req.view.id, result.rows[0])
            res.render(formView, {
                messages: req.session.messages || [],
                content: req.view,
                tools: utils,
                breadcrumb_menu: req.breadcrumbs,
                formSchema: builder.forms.create(
                    {
                        view: formView,
                        name: 'Update',
                        routes: {
                            submit: req.url,
                            cancel: '/',
                            confirm: '',
                            success: successPath
                        }, method: 'POST'
                    },
                    users.schema,
                    result.rows[0],
                    widget),
                validatorSchema: builder.forms.validator(formView, req.formID, users.schema)
            });
            res.cleanup();
        })
        .catch((err) => {
            res.message(err);
            next();
        });
}


// ------- update user profile -------
exports.update = async (req, res, next) => {
    try {
        await users.update( req.body )
            .then((result) => {
                if (!result.rows) throw new Error('User not found.');
                res.message({severity:'success', code:'register'});
            })
            .catch((err) => {
                res.message(err);
            })
            .finally(() =>{
                console.log('Redirecting to %s', path.join('users', req.params.users_id, 'edit'))
                res.redirect(path.join('/users', req.params.users_id, 'edit'))
            }
            );
    } catch(e) {
        res.message(e);
        res.redirect(path.join('/users', req.params.users_id));
    }
}



// ------- remove user confirmation -------
exports.remove = async (req, res, next) => {
    const successPath = '/';
    const failPath = '/';
    try {
        res.render('register', {
            messages: req.session.messages || [],
            content: req.view,
            tools: utils,
            breadcrumb_menu: req.breadcrumbs,
            formSchema: forms.registration({
                    name: 'Delete',
                    routes: {
                        submit: req.url,
                        cancel: '/users',
                        confirm: '',
                        success: successPath
                    },
                    method: 'POST'
                },
                users.schema,
                {})
        });
        res.cleanup();
    } catch(e) {
        res.message(e);
        res.redirect(failPath);
    }
}

// ------- delete user from db -------
exports.delete = async (req, res, next) => {
    const resultPath = '/';
    try {
        await users.delete(req.body)
            .then((result) => {
                if (!result) throw new Error('User could not be deleted.')
                res.message(null, 'db-1', 'success');
            })
            .catch((err) => {
                res.message(err, 'db-1', 'error');
            })
            .finally(() =>{
                    console.log('Redirecting to %s', resultPath);
                    res.redirect(resultPath)
                }
            );
    } catch(e) {
        res.message(e, 'db-1', 'error');
        res.redirect(resultPath);
    }
}


