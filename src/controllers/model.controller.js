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
import * as cserve from '../services/construct.services.js';
import * as nserve from '../services/nodes.services.js';
import * as fserve from '../services/files.services.js';
import * as metaserve from '../services/metadata.services.js';
import { prepare } from '../lib/api.utils.js';
import pool from '../services/db.services.js';
import { sanitize } from '../lib/data.utils.js';
import { selectByOwner } from '../services/nodes.services.js';

/**
 * Shared data.
 *
 * @src public
 */

let Model, model, mserve;

/**
 * Export controller constructor.
 *
 * @param {String} nodeType
 * @src public
 */

export default function ModelController(nodeType) {

    // check node type is not null
    if (!nodeType) throw new Error('invalidModel');

    /**
     * Initialize the controller: generate services for model
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.init = async () => {
        Model = await cserve.create(nodeType);
        model = new Model();
        mserve = new ModelServices(model);
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
            ? parseInt(req.params[model.key])
            : null;
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

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {

            // get requested node ID
            let id = parseInt(this.getId(req));

            // get item data
            let item = await nserve.get(sanitize(id, 'integer'));
            // get node path
            const path = await nserve.getPath(item.node);

            // item record and/or node not found in database
            if (!item)
                return next(new Error('notFound'));

            // append second-level dependents (if node depth is above threshold)
            if (model.depth > 1) {
                item.dependents = await Promise.all(
                    item.dependents.map(async (dependent) => {
                        const {node={}} = dependent || {};
                        dependent.dependents = await selectByOwner(node.id, client);
                        return dependent;
                    }));
            }

            console.log(model.name, model.depth, item)

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: item,
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            client.release(true);
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
        try {

            // get owner ID from parameters (if exists)
            let { owner_id=0 } = parseInt(req.params) || {};

            // create model instance
            const item = owner_id
                ? new Model({owner_id: owner_id})
                : new Model();

            // get path of node in hierarchy
            const owner = await nserve.select(owner_id);
            const path = await nserve.getPath(owner) || {};

            // include metadata options
            model.options = metaserve.getOptions();

            // send form data response
           res.status(200).json(
               prepare({
                    view: 'new',
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
        const client = await pool.connect();

        try {

            // get owner ID from parameters (if exists)
            const { owner_id=null } = req.params || {};
            let owner_type = model.name;

            // handle nodes with owners
            if (model.hasOwner) {

                // get owner node; check that node exists in database
                // and corresponds to requested owner type.
                const node = await nserve.select(owner_id, client);

                // check relation exists for file type and node type
                const isRelated = await fserve.checkRelation(node.type, model.name, client);
                if (!node || isRelated)
                    return next(new Error('invalidRequest'));

                owner_type = node.type
            }

            // stream uploaded files to server
            const metadata = await fserve.upload(req, owner_id, owner_type);

            console.log(metadata)

            // process saved file data and model metadata
            await Promise.all(Object.keys(metadata.files).map(async (key) => {
                await fserve.saveFile(key, metadata);
                console.log('Saved File:', metadata.files[key])
            }));

            // insert metadata into appropriate db records
            const resData = (Object.keys(metadata.files).length > 0)
                ? await mserve.import(metadata)
                : await mserve.insert(new Model(metadata.data));

            // send create response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: resData,
                    message: {
                        msg: `${model.label} item created successfully!`,
                        type: 'success'
                    },
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            client.release();
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
            let data = await mserve.select(id);

            // get path of node in hierarchy
            const owner = await nserve.select(id);
            const path = await nserve.getPath(owner) || {};

            // include metadata options
            model.options = metaserve.getOptions();

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
     * Update database data.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.update = async (req, res, next) => {

        const client = await pool.connect();

        try {

            // get node data from parameters
            const id = this.getId(req);
            const node = await nserve.select(id);
            const path = await nserve.getPath(node);

            // get metadata fields
            const metadata = await fserve.upload(req, node.owner_id, model.name);

            // update database record
            const item = new Model(metadata.data);
            let data = await mserve.update(item);

            // send create response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: data,
                    message: {
                        msg: `${model.label} item updated successfully!`,
                        type: 'success'
                    },
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            client.release();
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
            let data = await mserve.select(id);
            let item = new Model(data);

            // get path of owner node in hierarchy (if exists)
            const { owner_id=null } = data || {};
            const node = await nserve.select(owner_id);
            const path = await nserve.getPath(node);

            // delete item
            data = await mserve.remove(item);

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

    /**
     * Select files and data for batch import.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.browse = async (req, res, next) => {

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {

            // get owner ID from parameters (if exists)
            let { owner_id=null } = req.params || {};

            // get owner node in hierarchy
            const node = await nserve.select(owner_id, client);

            // check if node is valid (exists)
            if (!node)
                return next(new Error('notFound'));

            // create model instance
            const item = owner_id
                ? new Model({owner_id: owner_id})
                : new Model();

            // include metadata options
            model.options = metaserve.getOptions();

            // get path of node in hierarchy
            const owner = await nserve.select(owner_id, client);
            const path = await nserve.getPath(owner) || {};

            // check relation exists for file type and node type
            const isRelated = await fserve.checkRelation(node.type, model.name, client);
            if (!node || isRelated)
                return next(new Error('invalidRequest'));

            // get associated file type from capture type
            const fileTypes = await fserve.getFileTypesByOwner(model.name, client);
            const allowedTypes = ['historic_images', 'modern_images'];

            // check that file type is allowed for given node type
            if (!fileTypes.every((val) => allowedTypes.includes(val)))
                return next(new Error('invalidRequest'));

            // get first file type from results
            const fileType = fileTypes[0];

            // check that file type is valid
            if (!fileType)
                return next(new Error('invalidRequest'));

            // include image state in model
            model.addAttribute('image_state', 'varchar');
            model.setOptions('image_state', options.imageStates);

            // get linked data referenced in node tree
            return res.status(200).json(
                prepare({
                    view: 'import',
                    model: model,
                    data: item.getData(),
                    path: path
                }));

        } catch (err) {
            return next(err);
        } finally {
            client.release();
        }
    };

    /**
     * Batch import data.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.import = async (req, res, next) => {

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {

            // get owner ID from parameters (if exists)
            let { owner_id=null } = req.params || {};

            // get owner node; check that node exists in database
            // and corresponds to requested owner type.
            const node = await nserve.select(owner_id, client);

            // check relation exists for file type and node type
            const isRelated = await fserve.checkRelation(node.type, model.name, client);
            if (!node || isRelated)
                return next(new Error('invalidRequest'));

            // get associated file type from capture type
            const fileTypes = await fserve.getFileTypesByOwner(model.name, client);
            const allowedTypes = ['historic_images', 'modern_images'];

            // check that file type is allowed for given node type
            if (!fileTypes.every((val) => allowedTypes.includes(val)))
                return next(new Error('invalidRequest'));

            // get first file type from results
            const fileType = fileTypes[0];

            // check that file type is valid
            if (!fileType)
                return next(new Error('invalidRequest'));

            // stream uploaded files to server
            const metadata = await fserve.upload(req);

            // process file stream and metadata
            await fserve.saveFile(fileType, metadata);

            // insert metadata into appropriate db records
            await mserve.import(metadata);

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            client.release();
        }
    };

}
