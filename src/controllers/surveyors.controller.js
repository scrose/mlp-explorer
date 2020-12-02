/*!
 * MLP.API.Controllers.Surveyors
 * File: surveyors.controller.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import * as db from '../services/db.services.js';
import valid from '../lib/validate.utils.js';

/**
 * Initialize controller.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

let Surveyor, services;

export const init = async (req, res, next) => {
    // generate model
    Surveyor = await db.model.create('surveyors')
        .catch((err) => next(err));
    // generate db services
    services = db.services('surveyors');
};

/**
 * List all surveyors
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const list = async (req, res, next) => {
    await services
        .getAll()
        .then((data) => {
            res.locals.surveyors = data.rows;
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Show surveyor data. Include survey data.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const show = async (req, res, next) => {
    await services
        .select(req.params.surveyor_id)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('nosurveyor');
            res.status(200).json({ surveyor: data.rows[0] });
        })
        .catch((err) => next(err));
};

/**
 * UserModel registration interface. Note: registration is currently
 * restricted to Administrators, but can be open to visitors by
 * removing restrict().
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const register = async (req, res, next) => {
    // remove to open to visitors
    //restrict(res, next, config.roles.Administrator);

    try {
        // let args = {
        //   model: new UserModel(),
        //   view: res.locals.view,
        //   method: 'POST',
        //   legend: 'UserModel Registration',
        //   actions: {
        //     submit: { value: 'Register', url: '/surveyors/register' },
        //     cancel: { value: 'Cancel', url: '/' },
        //   },
        //   restrict: null,
        // };
        // let { form, validator } = builder.form(args);
        // res.locals.form = form;
        // res.locals.validator = validator;
        res.status(200).json(res.locals);
    } catch (err) {
        next(err);
    }
};

/**
 * Add (i.e. register) new surveyor to database.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const create = async (req, res, next) => {
    let newUser;
    try {
        // validate surveyor input data

        let { email, password, role_id } = req.body;
        newUser = new User({
            email: valid.load(email).isEmail().data,
            password: valid.load(password).isPassword().data,
            role_id: role_id,
        });
        newUser.encrypt();
    } catch (err) {
        next(err);
    }

    // Insert surveyor in database
    await db.surveyors
        .insert(newUser)
        .then((data) => {
            if (data.rows.length === 0)
                throw new Error('register');
            let surveyor_id = data.rows[0].surveyor_id;
            // // send confirmation email to surveyor
            // utils.email.send(surveyor.email, "Verify registration.");
            res.message('Registration was successful!', 'success');
            req.session.save(function(err) {
                res.locals.surveyor_id = surveyor_id;
                if (err) throw Error(err);
                // res.redirect('/');
                res.status(200).json(res.locals);
            });
        })
        .catch((err) => next(err));
};

/**
 * Edit the surveyor's profile data.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const edit = async (req, res, next) => {
    // retrieve surveyor roles
    const { roles } = await db.roles.getAll().catch((err) => next(err));

    await db.surveyors
        .select(res.locals.req_id)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('nosurveyor');
            let surveyor = new User(data);
            // add role options to model
            // surveyor.setOptions('role', roles);
            // // assemble build parameters
            // let args = {
            //     model: surveyor,
            //     view: res.locals.view,
            //     method: 'POST',
            //     legend: 'Update UserModel Profile',
            //     actions: {
            //         submit: { value: 'Update', url: path.join('/surveyors', res.locals.surveyors_id, 'edit') },
            //         cancel: { value: 'Cancel', url: '/' },
            //     },
            //     restrict: req.session.surveyor || null,
            // };
            // let { form, validator } = builder.form(args);
            // res.locals.form = form;
            // res.locals.validator = validator;
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Update the surveyor's profile data.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const update = async (req, res, next) => {
    let surveyor;
    try {
        surveyor = new User(req.body);
    } catch (err) {
        next(err);
    }
    // update surveyor data
    await db.surveyors
        .update(surveyor)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('update');
            res.locals.surveyor = data.rows[0];
            res.message('Update successful!', 'success');
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Confirm removal of surveyor.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const remove = async (req, res, next) => {
    await db.surveyors
        .select(req.params.surveyor_id)
        .then((data) => {
            if (data.rows.length === 0)
                throw new Error('nosurveyor');
            // let surveyor = new User(data);
            // let { form, validator } = builder.form(
            //     {
            //         view: res.locals.name,
            //         name: 'Delete',
            //         method: 'POST',
            //         routes: {
            //             submit: path.join('/surveyors', res.locals.req_id, 'delete'),
            //             cancel: '/surveyors',
            //         },
            //     },
            //     surveyor,
            // );
            // res.locals.form = form;
            // res.locals.validator = validator;
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Delete surveyor.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const drop = async (req, res, next) => {
    await db.surveyors
        .remove(req.params.surveyor_id)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('nosurveyor');
            res.locals.surveyor_id = data.rows[0].surveyor_id;
            res.message('User ' + res.locals.surveyor_id + ' successfully deleted.', 'success');
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};
