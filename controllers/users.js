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
const utils = require('../utilities')
const path = require('path')
const users = require('../models')({ type: modelName });
const params = require('../params')
const forms = require('../views/builder/forms')

exports.engine = 'ejs';


/*
------------------------------------------------------
  Controller Support Functions
------------------------------------------------------
*/

// authenticate user
function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    const user = users[name];
    // query the db for the given username
    if (!user) return fn(new Error('cannot find user'));
    // apply the same algorithm to the POSTed password, applying
    // the hash against the pass / salt, if there is a match we
    // found the user
    hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
        if (err) return fn(err);
        if (hash === user.hash) return fn(null, user)
        fn(new Error('invalid password'));
    });
}

// restrict user permissions by role
function restrict(req, res, next) {
    console.log('Restrict user');
    next();
    // if (req.session.user || (req.method === 'GET' && req.url === '/login')) {
    //     next();
    // } else {
    //     req.session.error = 'Access denied!';
    //     res.redirect('/login');
    // }
}

// restrict user permissions by role
function validate( data ) {
    let tester = utils.validator(data);
    console.log(tester, data)
    // Email
    // console.log(tester(data.email).isEmail().getErrors())
}


/*
------------------------------------------------------
  Controller Handlers
------------------------------------------------------
*/

// preliminary handler
exports.before = async (req, res, next) => {
    // Add boilerplate content
    req.content = params.settings.general;

    // event-specific request variables
    req.content.model = modelName;
    req.formID = modelName;
    req.content.id = req.params.users_id ? req.params.users_id : null;
    req.content.uri = modelName;

    // restrict user permissions by role
    restrict(req, res, next);
};


// list all users
exports.list = async (req, res, next) => {
    await users.findAll()
        .then((result) => {
            if (!result.rows) throw "Users not found."
            res.render('list', {
                messages: req.session.messages || [],
                content: req.content,
                tools: utils,
                breadcrumb_menu: req.breadcrumbs,
                users: result.rows
            });
            res.cleanup();
        })
        .catch((err) => {
            res.message(err, 'db-1', 'error');
            next();
        });
};


// register new user
exports.register = async (req, res, next) => {
    // const roles = await users.findAllRoles();
    // let roles_select = await forms.select('role_id', users.userRolesSchema, roles.rows);
    // let widget = {'role_id': roles_select}
    const successPath = '/';
    const failPath = '/';
    try {
        res.render('register', {
            messages: req.session.messages || [],
            content: req.content,
            tools: utils,
            breadcrumb_menu: req.breadcrumbs,
            form: forms.registration({
                name: 'Register',
                paths: {
                    submit: '/users/insert',
                    cancel: '/',
                    confirm: '',
                    success: successPath
                },
                method: 'POST'
            },
            users.schema,
            {}),
            validator: forms.validator(req.formID, users.schema)
        });
        res.cleanup();
    } catch(e) {
        res.message(e);
        res.redirect(failPath);
    }
};


// insert user into db
exports.insert = async (req, res, next) => {
    const resultPath = '/';
    try {
        // validate body
        validate(req.body);

        await users.insert(req.body)
            .then((result) => {
                if (!result) throw "User could not be added."
                console.log(result.rows);
                let userEmail = result.rows[0].email;
                // send confirmation email to user
                utils.email.send(userEmail, "Verify registration.");
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


// show single user
exports.show = async (req, res, next) => {
    await users.findById(req.content.id)
        .then((result) => {
            if (!result) throw "User not found."
            res.render('show', {
                messages: req.session.messages || [],
                content: req.content,
                tools: utils,
                breadcrumb_menu: req.breadcrumbs,
                user: result.rows[0]
            });
            res.cleanup();
        })
        .catch((err) => {
            res.message(err, 'db-1', 'error');
            res.redirect('/users');
        });
};


// edit user data
exports.edit = async (req, res, next) => {
    try {
        const roles = await users.findAllRoles();
        let roles_select = await forms.select('role_id', users.userRolesSchema, roles.rows);
        await users.findById(req.content.id)
            .then((result) => {
                if (!result) throw "User not found."
                res.render('edit', {
                    messages: req.session.messages || [],
                    content: req.content,
                    tools: utils,
                    breadcrumb_menu: req.breadcrumbs,
                    form: forms.create({
                            paths: {
                                submit: req.url,
                                cancel: path.join('/', modelName, req.content.id),
                                confirm: '',
                                success: ''
                            },
                            method: 'POST'
                        },
                        users.schema,
                        result.rows[0],
                        {'role_id': roles_select})
                });
                res.cleanup();
            })
            .catch((err) => {
                res.message(err, 'db-1', 'error');
                res.redirect('/users');
            });

    } catch(e) {
        res.message(e, 'db-1', 'error');
        res.redirect('/users');
    }
}


// update user data
exports.update = async (req, res, next) => {
    try {
        await users.update(req.body)
            .then((result) => {
                if (!result) throw "User not found."
                res.message(null, 'db-1', 'success');
            })
            .catch((err) => {
                res.message(err, 'db-1', 'error');
            })
            .finally(() =>{
                console.log('Redirecting to %s', path.join('users', req.params.users_id, 'edit'))
                res.redirect(path.join('/users', req.params.users_id, 'edit'))
            }
            );
    } catch(e) {
        res.message(e, 'db-1', 'error');
        res.redirect('/users');
    }
}




// user login
exports.login = (req, res, next) => {
    res.render('login', {
        message: null,
        model: modelName,
        content: req.content,
        breadcrumb_menu: req.breadcrumbs,
        form: forms.login({
            name: 'login',
            submitURL: req.url,
            cancelURL: null,
            method: 'POST'
        }, users.schema)
    });
};


// authenticate user
exports.auth = async (req, res, next) => {
    await users.findByEmail(req.body.username)
        .then((user) => {
            res.statusCode = 200;
            res.statusMessage = null;
            authenticate(req.body.username, req.body.password, function(err, user){
                if (user) {
                    // Regenerate session when signing in to prevent fixation
                    req.session.regenerate(function(){
                        // Store the user's primary key
                        // in the session store to be retrieved,
                        // or in this case the entire user object
                        req.session.user = user;
                        req.session.success = 'Authenticated as ' + user.name
                            + ' click to <a href="/logout">logout</a>. '
                            + ' You may now access <a href="/restricted">/restricted</a>.';
                        res.redirect('back');
                    });
                } else {
                    console.log('Authentication failed for %s', user.email)
                    throw "Authentication failed.";
                }
            });
        })
        .catch((err) => {
            res.statusCode = 400;
            res.statusMessage = "User not found:" + err;
            req.session.error = 'Authentication failed, please check your '
                + ' username and password.'
                + ' (use "tj" and "foobar")';
            res.redirect('/login');
        });
}

