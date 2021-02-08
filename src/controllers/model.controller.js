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

import ModelServices from '../services/model.services.js';
import * as cs from '../services/construct.services.js';
import * as ns from '../services/nodes.services.js'
import { prepare } from '../lib/api.utils.js';

/**
 * Shared data.
 *
 * @src public
 */

let Model, model, db;

/**
 * Export controller constructor.
 *
 * @param {String} modelRoute
 * @src public
 */

export default function ModelController(modelRoute) {

    // check model not null
    if (!modelRoute) throw new Error('invalidModel');

    /**
     * Initialize the controller: generate services for model
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.init = async () => {
        Model = await cs.create(modelRoute);
        model = new Model();
        db = new ModelServices(model);
    }

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
                        view: 'list',
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
            const item = new Model(data);

            // get path of node in hierarchy
            const node = await ns.select(id);
            const path = await ns.getPath(node);

            // node not in database
            if (!data || !node )
                return next(new Error('notFound'));

            // get linked data referenced in node tree
            return await ns.getModelDependents(item)
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
            ? new Model({owner_id: owner_id})
            : new Model();

        // get path of node in hierarchy
        const owner = await ns.select(owner_id);
        const path = await ns.getPath(owner) || {};

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

            // get path of node in hierarchy
            const { nodes_id=null } = data || {};
            const node = await ns.select(nodes_id);
            const path = await ns.getPath(node);

            res.status(200).json(
                prepare({
                    view: 'add',
                    model: model,
                    data: data,
                    message: {
                        msg: `Item added successfully!`,
                        type: 'success'
                    },
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
    };

    /**
     * Get model schema to edit record data.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.edit = async (req, res, next) => {
        try{

            // get node ID from parameters
            const id = this.getId(req);

            // get item data
            let data = await db.select(id);

            // get path of node in hierarchy
            const owner = await ns.select(id);
            const path = await ns.getPath(owner) || {};

            // send form data response
            res.status(200).json(
                prepare({
                    view: 'edit',
                    model: model,
                    data: data,
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
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
        try {
            let item = new Model(req.body);

            // insert item into database
            let data = await db.update(item);

            // get path of node in hierarchy
            const { nodes_id=null } = data || {};
            const node = await ns.select(nodes_id);
            const path = await ns.getPath(node);

            res.status(200).json(
                prepare({
                    view: 'edit',
                    model: model,
                    data: data,
                    message: {
                        msg: `Update successful!`,
                        type: 'success'
                    },
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }

    };

    /**
     * Delete record.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.remove = async (req, res, next) => {
        try {
            const id = this.getId(req);

            // retrieve item data
            let data = await db.select(id);
            let item = new Model(data);

            // get path of owner node in hierarchy (if exists)
            const { owner_id=null } = data || {};
            const node = await ns.select(owner_id);
            const path = await ns.getPath(node);

            // delete item
            data = await db.remove(item);

            res.status(200).json(
                prepare({
                    view: 'remove',
                    model: model,
                    data: data,
                    message: {
                        msg: `Deletion successful!`,
                        type: 'success'
                    },
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
    };
}
