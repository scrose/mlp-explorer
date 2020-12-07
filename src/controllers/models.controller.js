/*!
 * MLP.API.Controllers.Model
 * File: models.controller.js
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
import { toCamel, toSnake } from '../lib/data.utils.js';

/**
 * Export controller constructor.
 *
 * @param {String} model
 * @src public
 */

let Model, services;



// generate controller constructor
export default function Controller(modelRoute) {

    // check model exists
    if (!models.hasOwnProperty(toCamel(modelRoute)))
        throw new Error('invalidModel');

    // set model name/key
    this.modelName = toCamel(modelRoute);
    this.table = toSnake(modelRoute)
    this.modelKey = `${toSnake(modelRoute)}_id`;

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
        Model = await db.model.create(modelRoute)
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
            console.log(req.body)
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
                res.message(`Added item to ${modelRoute}.`, 'success');
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
        let id = this.getId(req.params);
        await services
            .select(id)
            .then((data) => {
                if (data.rows.length === 0)
                    throw new Error('noitem');
                let model = new Model(data);
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
        let id = this.getId(req.params);
        await services
            .select(id)
            .then((data) => {
                if (data.rows.length === 0)
                    throw new Error('noitem');
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
        let id = this.getId(req.params);
        await services
            .remove(id)
            .then((data) => {
                if (data.rows.length === 0) throw new Error('noitem');
                res.locals.data = data.rows[0];
                res.message('Item successfully deleted.', 'success');
                res.status(200).json(res.locals);
            })
            .catch((err) => next(err));
    };
}


