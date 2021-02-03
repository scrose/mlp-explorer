/*!
 * MLP.API.Controllers.Model
 * File: model.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import DBServices from '../services/db.services.js';
import FileServices from '../services/files.services.js';
import * as modelServices from '../services/model.services.js';
import * as ns from '../services/nodes.services.js'
import { prepare } from '../lib/api.utils.js';

/**
 * Export controller constructor.
 *
 * @param {String} model
 * @src public
 */

let Model, model, db, filer;

// generate controller constructor
export default function ModelController(modelRoute) {

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
        Model = await modelServices
            .create(modelRoute)
            .catch(err => {
                return next(err);
            });

        // generate services for model
        try {
            model = new Model();
            db = new DBServices(new Model());
            filer = new FileServices();
        }
        catch (err) {
            console.error('Model services generator error.')
            return next(err);
        }
        return next();
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
        return req.params.hasOwnProperty(model.key)
            ? req.params[model.key]
            : null;
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
        await db
            .getAll()
            .then(data => {
                res.status(200).json(
                    prepare({
                        view: 'listNodes',
                        model: model,
                        data: data,
                        path: model
                    }));
            })
            .catch(err => {
                return next(err);
            });
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

        try {
            // get requested node ID
            let id = this.getId(req);

            // get record data for node
            const data = await db.select(id);
            const node = await ns.getNode(id);
            const item = new Model(data);

            // get path of node in hierarchy
            const path = await ns.getNodePath(node);

            // get linked data referenced in node tree
            await ns.getModelDependents(item)
                .then(dependents => {

                    // append dependent nodes to data
                    data.dependents = dependents;

                    res.status(200).json(
                        prepare({
                            view: 'show',
                            model: model,
                            data: data,
                            path: path
                        }));
                })
        } catch (err) {
            console.error(err)
            return next(err);
        }
    };

    /**
     * Get model schema to create new record.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.add = async (req, res, next) => {

        // get owner ID from parameters (if exists)
        let { owner_id=null } = req.params || {};

        // create model instance
        const item = owner_id
            ? model.setData({owner_id: owner_id})
            : model;

        // get path of node in hierarchy
        const owner = await ns.getNode(owner_id);
        const path = await ns.getNodePath(owner) || {};

        try {
            // send form data response
           res.status(200).json(
               prepare({
                    view: 'add',
                    model: model,
                    data: item.getData(),
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
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

        try {
            let item = new Model(req.body);

            // insert item into database
            let data = await db.insert(item);

            console.log(data)

            // get path of node in hierarchy
            const { nodes_id=null } = data || {};
            const node = await ns.getNode(nodes_id);
            const path = await ns.getNodePath(node);

            res.status(200).json(
                prepare({
                    view: 'add',
                    model: model,
                    data: data,
                    message: {
                        msg: `New record added successfully!`,
                        type: 'success'
                    },
                    path: path
                }));

        } catch (err) {
            next(err);
        }
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
        await db
            .select(id)
            .then(data => {
                res.status(200).json(
                    prepare({
                        view: 'edit',
                        model: model,
                        data: data
                    }));
            })
            .catch(err => next(err));
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

        // create model instance
        let item;
        try {
            item = new Model(req.body);
        } catch (err) {
            next(err);
        }

        // update record
        await db
            .update(item)
            .then(data => {
                res.status(200).json(
                    prepare({
                        view: 'update',
                        model: model,
                        data: data,
                        message: {
                            msg: `Update successful!`,
                            type: 'success'
                        }
                    }));
            })
            .catch(err => next(err));
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
        await db
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
        let item = await db
            .select(id)
            .then((data) => {
                if (data.rows.length === 0) throw new Error('norecord');
                return new Model(data.rows[0]);
            })
            .catch((err) => next(err));

        // delete item
        await db
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
