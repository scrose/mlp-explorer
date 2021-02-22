/*!
 * MLP.API.Controllers.Files
 * File: files.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import * as db from '../services/index.services.js';
import ModelServices from '../services/model.services.js';
import * as fserve from '../services/files.services.js';
import * as nserve from '../services/nodes.services.js';
import { prepare } from '../lib/api.utils.js';

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

    this.init = async () => {

        try {

            // generate model constructor
            Model = await db.model.create(modelType);
            model = new Model();
            services = new ModelServices(new Model());

            // include image states (if needed)
            if (model.hasAttribute('image_state')) {
                const imageStates = await fserve.getImageStates();
                model.setOptions('image_state', imageStates);
            }
        } catch (err) {
            console.error(err)
        }
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
     * Show file data.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.show = async (req, res, next) => {
        try {
            // get requested file ID
            let id = this.getId(req);

            // get file data
            const file = await fserve.select(id);
            file.data = await fserve.selectByFile(file);

            // get path of owner node in hierarchy
            const node = await nserve.select(file.owner_id);
            const path = await nserve.getPath(node);

            // file or node not in database
            if (!file || !node )
                return next(new Error('notFound'));

            // get linked data referenced in node tree
            return res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: file,
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
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
        try {
            // get requested file ID
            const ownerID = this.getId(req);

            // get path of owner node in hierarchy
            const node = await nserve.select(ownerID);
            const path = await nserve.getPath(node);

            // file or node not in database
            if (!node )
                return next(new Error('notFound'));

            // get linked data referenced in node tree
            return res.status(200).json(
                prepare({
                    view: 'upload',
                    model: model,
                    data: node,
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
    };

    /**
     * Upload files.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.upload = async (req, res, next) => {

        try {

            // get requested file ID
            const ownerID = this.getId(req);

            // get owner node; check that node exists in database
            // and corresponds to requested owner type.
            const node = await nserve.select(ownerID);

            // check relation exists for file type and node type
            const isRelation = await fserve.checkRelation(node.type, model.name);

            console.log(model.name, node, isRelation)

            if (!node || !isRelation)
                return next(new Error('notFound'));

            // initialize file metadata
            let metadata = {
                file: {
                    file_type: model.name,
                    mimetype: null,
                    filename: null,
                    owner_id: node.id,
                    owner_type: node.type,
                    file_size: 0,
                    fs_path: null
                }
            };

            // stream uploaded files to server
            await fserve.asyncUpload(req, res, next, metadata);

        } catch (err) {
            return next(err);
        }
    };
}
