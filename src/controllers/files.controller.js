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
import pool from '../services/db.services.js';
import * as metaserve from '../services/metadata.services.js';

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

    this.init = async () => {

        try {

            // generate model constructor
            Model = await db.model.create(modelType);
            model = new Model();
            services = new ModelServices(new Model());

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

    this.getId = function(req) {
        try {
            // Throw error if route key is invalid
            return req.params[model.key];
        } catch (err) {
            throw new Error('invalidRouteKey');
        }
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

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {
            // get requested node ID
            let id = parseInt(this.getId(req));

            // get file data
            const fileData = await fserve.get(id, client);

            const { file = null } = fileData || {};
            const { owner_id = '' } = file || {};

            // get path of owner node in hierarchy
            const node = await nserve.select(owner_id, client);
            const path = await nserve.getPath(file);

            // file or node not in database
            if (!fileData || !node)
                return next(new Error('notFound'));

            // get linked data referenced in node tree
            return res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: fileData,
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
     * Get file schema to edit record data.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.edit = async (req, res, next) => {

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {

            // get node ID from parameters
            const id = this.getId(req);

            // get file data
            const fileData = await fserve.get(id, client);

            const { file = null } = fileData || {};
            const { owner_id = '' } = file || {};

            // get path of owner node in hierarchy
            const node = await nserve.select(owner_id, client);
            const path = await nserve.getPath(file);

            // include metadata options
            model.options = await metaserve.getOptions();

            // send form data response
            res.status(200).json(
                prepare({
                    view: 'edit',
                    model: model,
                    data: fileData,
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
    };

    /**
     * Update file metadata.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.update = async (req, res, next) => {

        const client = await pool.connect();

        try {

            // get file data
            const fileData = await fserve.get(id, client);

            const { file = null } = fileData || {};
            const { owner_id = '' } = file || {};

            // get path of owner node in hierarchy
            const node = await nserve.select(owner_id, client);
            const path = await nserve.getPath(file);

            // include metadata options
            model.options = await metaserve.getOptions();

            // send create response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: fileData,
                    path: path,
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
            if (!node)
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
            const nodeRelations = await fserve.getFileTypesByOwner(model.name);

            if (!node || true)
                return next(new Error('invalidRequest'));

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
            await fserve.upload(req, res, next, metadata);

        } catch (err) {
            return next(err);
        }
    };


    /**
     * Get image data for mastering.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.master = async (req, res, next) => {

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {

            // get node ID from parameters
            const id = this.getId(req);

            // get file data
            const fileData = await fserve.get(id, client);

            const { file = null } = fileData || {};
            const { owner_id = '' } = file || {};

            // get path of owner node in hierarchy
            const node = await nserve.select(owner_id, client);
            const path = await nserve.getPath(file);

            // get station ID
            const stationKey = Object.keys(path)
                .find(key => {
                    const {node={}} = path[key] || {};
                    const {type=''} = node || {};
                    return type === 'stations';
                });
            if (!stationKey)
                return next(new Error('invalidRequest'));
            const station = path[stationKey].node;

            // include possible historic images to align
            // append full data for each dependent node
            let captures = await metaserve.getHistoricCapturesByStation(station, client);

            model.options = {
                historic_captures: captures
            };

            // send form data response
            res.status(200).json(
                prepare({
                    view: 'master',
                    model: model,
                    data: fileData,
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
    }
}

