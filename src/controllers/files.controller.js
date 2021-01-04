/*!
 * MLP.API.Controllers.Files
 * File: files.controller.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import * as db from '../services/index.services.js';
import DBServices from '../services/db.services.js';


/**
 * Export controller constructor.
 *
 * @param {String} model
 * @src public
 */

let Model, model, services;

export default function FilesController(modelType) {

    /**
     * Initialize the controller.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

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
        Model = await db.model.create(modelType)
            .catch((err) => next(err));

        // generate db services for model
        try {
            model = new Model();
            services = new DBServices(new Model());


            console.log('\n\n\n!!!!!!!\n\n\n', services, '\n\n\n!!!!!!!\n\n\n')
        }
        catch (err) {
            next(err);
        }

        next();
    };


    /**
     * Get file id value from request parameters. Note: use model
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
        await services
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
     * Select image files for upload.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.browse = async (req, res, next) => {

        console.log('Browse Image files');
    };

    /**
     * Upload bulk image files.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.upload = async (req, res, next) => {

        if (!req.body.files) return next();

    };
}
