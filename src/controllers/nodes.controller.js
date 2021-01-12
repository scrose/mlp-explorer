/*!
 * MLP.API.Controllers.Model
 * File: nodes.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import DBServices from '../services/db.services.js';
import FileServices from '../services/files.services.js';
import * as db from '../services/index.services.js';

/**
 * Export controller constructor.
 *
 * @param {String} model
 * @src public
 */

let Model, model, dbServices, fileServices;

// generate controller constructor
export default function NodesController(modelRoute) {

    // check model not null
    if (!modelRoute) throw new Error('invalidModel');

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

        // generate services for model
        try {
            model = new Model();
            dbServices = new DBServices(new Model());
            fileServices = new FileServices();
        }
        catch (err) {
            next(err);
        }

        next();
    };

    /**
     * Get model id value from request parameters. Note: use model
     * route key (i.e. model.key = '<model_name>_id') to reference route ID.
     *
     * @param {Object} params
     * @return {String} Id
     * @src public
     */

    this.getId = function (req) {
        try {
            // Throw error if route key is invalid
            return req.params[model.key];
        }
        catch (err) {
            throw new Error('invalidRouteKey');
        }
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
        await dbServices
            .getAll()
            .then(data => {
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
        let id = this.getId(req);
        await dbServices
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
                model: model,
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

        // insert item into database
        await dbServices
            .insert(item)
            .then((data) => {
                if (data.length === 0)
                    throw new Error('notadded');
                // retrieve last response data
                res.locals.data = data.rows[0];
                res.message(`Added item to ${item.label}.`, 'success');
                res.status(200).json(res.locals);
            })
            .catch((err) => next(err));

        // upload files (if required)
        await fileServices
            .uploadImages(req.files)
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
        let id = this.getId(req);
        await dbServices
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
        await dbServices
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
        let id = this.getId(req);
        await dbServices
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
        let id = this.getId(req);

        // retrieve item
        let item = await dbServices
            .select(id)
            .then((data) => {
                if (data.rows.length === 0) throw new Error('norecord');
                return new Model(data.rows[0]);
            })
            .catch((err) => next(err));

        // delete item
        await dbServices
            .remove(item)
            .then(data => {
                if (data.rows.length === 0) throw new Error('noitem');
                res.locals.data = data.rows[0];
                res.message('Item successfully deleted.', 'success');
                res.status(200).json(res.locals);
            })
            .catch((err) => next(err));
    };
}