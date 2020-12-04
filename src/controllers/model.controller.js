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

import Services from '../services/db.services.js';
import * as db from '../services/index.services.js';
import { models } from '../../config.js';

/**
 * Export controller constructor.
 *
 * @param {String} model
 * @src public
 */

let Model, services;


// generate controller constructor
export default function Controller(model) {

    // check model exists
    if (!models.hasOwnProperty(model))
        throw new Error('invalidModel');

    // set model name/key
    this.modelName = model;
    this.modelKey = model + '_id'

    /**
     * Get model id value from request parameters.
     *
     * @param {Object} params
     * @return {String} Id
     * @src public
     */

    this.getId = function (params) {

        // Ensure model id key is valid
        if (typeof params[this.modelKey] === 'undefined')
            throw new Error('controller')

        return params[this.modelKey];
    };

    /**
     * Initialize the controller.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.init = async (req, res, next) => {
        // generate model constructor
        Model = await db.model.create(model)
            .catch((err) => next(err));

        // generate db services for model
        try {
            services = new Services(new Model());
        }
        catch (err) {
            next(err);
        }
        next();
    };

    /**
     * List all records in table.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.list = async (req, res, next) => {
        await services
            .getAll()
            .then((data) => {
                res.locals.data = data.rows;
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

    this.show = async (req, res, next) => {
        let id = this.getId(req.params);
        await services
            .select(id)
            .then((data) => {
                if (data.rows.length === 0) throw new Error('norecord');
                res.locals.data = data.rows[0];
                res.status(200).json(res.locals);
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

    this.add = async (req, res, next) => {
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

    this.create = async (req, res, next) => {
        let item;
        try {
            item = new Model(req.body);
        } catch (err) {
            next(err);
        }

        // Insert in database
        await services
            .insert(item)
            .then((data) => {
                if (data.rows.length === 0)
                    throw new Error('notadded');
                res.locals.data = data.rows[0];
                res.message(`Added item to ${model}.`, 'success');
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

    this.edit = async (req, res, next) => {
        await services
            .select(req.params.id)
            .then((data) => {
                if (data.rows.length === 0) throw new Error('nouser');
                let model = new Model(data);
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
     * Update record data.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.update = async (req, res, next) => {
        let item;
        try {
            item = new Model(req.body);
        } catch (err) {
            next(err);
        }
        // update user data
        await services
            .update(item)
            .then((data) => {
                if (data.rows.length === 0) throw new Error('update');
                res.locals.data = data.rows[0];
                res.message('Update successful!', 'success');
                res.status(200).json(res.locals);
            })
            .catch((err) => next(err));
    };

    /**
     * Confirm removal of record.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.remove = async (req, res, next) => {
        await services
            .select(req.params.id)
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
     * Delete record.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.drop = async (req, res, next) => {
        await services
            .remove(req.params.id)
            .then((data) => {
                if (data.rows.length === 0) throw new Error('nouser');
                res.locals.data = data.rows[0];
                res.message('Record successfully deleted.', 'success');
                res.status(200).json(res.locals);
            })
            .catch((err) => next(err));
    };
}


