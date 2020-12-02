/*!
 * MLP.API.Controllers.Model
 * File: users.controller.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import * as db from '../services/db.services.js';
import valid from '../lib/validate.utils.js'

/**
 * Initialize controller.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

let Model, services;

export const init = async (req, res, next) => {

    // generate model
    Model = await db.model.create(res.locals.model)
        .catch((err) => next(err));
    // generate db services
    services = db.services(res.locals.model);
};

/**
 * List all.
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
            res.locals.result = data.rows;
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Show record data.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const show = async (req, res, next) => {
    await services
        .select(req.params.id)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('norecord');
            res.status(200).json({ data: data.rows[0] });
        })
        .catch((err) => next(err));
};

/**
 * Add record to database.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const add = async (req, res, next) => {
    try {
        res.locals.schema = {
          model: new Model(),
          view: 'add',
        };
        res.status(200).json(res.locals);
    } catch (err) {
        next(err);
    }
};

/**
 * Insert record in database.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const create = async (req, res, next) => {
    let newModel;
    try {
        newModel = new Model(req.body);
    } catch (err) {
        next(err);
    }

    // Insert in database
    await services
        .insert(newModel)
        .then((data) => {
            if (data.rows.length === 0)
                throw new Error('notadded');
            res.message('Added record to database', 'success');
            res.locals.result = data;
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Edit record data.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const edit = async (req, res, next) => {

    await services
        .select(req.params.id)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('nouser');
            let user = new User(data);
            // add role options to model
            // user.setOptions('role', roles);
            // // assemble build parameters
            // let args = {
            //     model: user,
            //     view: res.locals.view,
            //     method: 'POST',
            //     legend: 'Update User Profile',
            //     actions: {
            //         submit: { value: 'Update', url: path.join('/users', res.locals.users_id, 'edit') },
            //         cancel: { value: 'Cancel', url: '/' },
            //     },
            //     restrict: req.session.user || null,
            // };
            // let { form, validator } = builder.form(args);
            // res.locals.form = form;
            // res.locals.validator = validator;
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Update the user's profile data.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const update = async (req, res, next) => {
    let user;
    try {
        user = new User(req.body);
    } catch (err) {
        next(err);
    }
    // update user data
    await db.users
        .update(user)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('update');
            res.locals.user = data.rows[0];
            res.message('Update successful!', 'success');
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Confirm removal of user.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const remove = async (req, res, next) => {
    await db.users
        .select(req.params.user_id)
        .then((data) => {
            if (data.rows.length === 0)
                throw new Error('nouser');
            // let user = new User(data);
            // let { form, validator } = builder.form(
            //     {
            //         view: res.locals.name,
            //         name: 'Delete',
            //         method: 'POST',
            //         routes: {
            //             submit: path.join('/users', res.locals.req_id, 'delete'),
            //             cancel: '/users',
            //         },
            //     },
            //     user,
            // );
            // res.locals.form = form;
            // res.locals.validator = validator;
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};

/**
 * Delete user.
 *
 * @param req
 * @param res
 * @param next
 * @src public
 */

export const drop = async (req, res, next) => {
    await db.users
        .remove(req.params.user_id)
        .then((data) => {
            if (data.rows.length === 0) throw new Error('nouser');
            res.locals.user_id = data.rows[0].user_id;
            res.message('User ' + res.locals.user_id + ' successfully deleted.', 'success');
            res.status(200).json(res.locals);
        })
        .catch((err) => next(err));
};
