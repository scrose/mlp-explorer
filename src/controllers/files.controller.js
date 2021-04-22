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
import { sanitize } from '../lib/data.utils.js';
import * as importer from '../services/import.services.js';
import * as cserve from '../services/construct.services.js';

/**
 * Export controller constructor.
 *
 * @param {String} model
 * @src public
 */

let Model, model, mserve;

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
            mserve = new ModelServices(new Model());

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
            let id = this.getId(req);

            // get file data
            const fileData = await fserve.get(id, client);

            const { file = null } = fileData || {};
            const { owner_id = '' } = file || {};

            // get path of owner node in hierarchy
            const owner = await nserve.select(
                sanitize(owner_id, 'integer'), client);

            // file or owner do not exist
            if (!fileData || !owner)
                return next(new Error('notFound'));

            // create node path
            const path = await nserve.getPath(file);

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
     * Upload files.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.upload = async (req, res, next) => {

        const client = await pool.connect();

        try {

            // get owner ID from parameters (if exists)
            const { owner_id = null } = req.params || {};

            // get owner metadata record
            const owner = await nserve.select(owner_id, client);
            const {type=''} = owner || {};

            // filter metadata through importer
            // - saves attached files to library
            // - collates metadata
            const metadata = await importer.receive(req, owner_id, type);

            // check if files are present
            if (Object.keys(metadata.files).length === 0) {
                return next(new Error('invalidRequest'));
            }

            // save file(s) and insert file metadata
            const resData = await fserve.insert(metadata, model.name, owner);

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: resData[0],
                    message: {
                        msg: `${resData.length} ${model.label} items created successfully!`,
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

            // get path of owner node in hierarchy
            const path = await nserve.getPath(file);

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

            // get file data from parameters
            const id = this.getId(req);
            const fileData = await fserve.get(id, client);

            // check that file entry exists
            if (!fileData) {
                return next(new Error('invalidRequest'));
            }

            // get metadata fields
            const {metadata='', file=''} = fileData || {};
            const {owner_id='', owner_type=''} = file || {};
            const imported = await importer.receive(req, owner_id, owner_type);

            // overwrite metadata
            Object.keys(imported.data).forEach((field) => {
                metadata[field] = imported.data[field];
            })

            // update file metadata record
            await fserve.update(new Model(metadata));

            // get updated file
            let updatedItem = await fserve.get(id);

            // get path of owner node in hierarchy
            const path = await nserve.getPath(file);

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: {},
                    message: {
                        msg: `'${updatedItem.label}' updated successfully!`,
                        type: 'success'
                    },
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            client.release();
        }
    };

    /**
     * Delete file and file metadata.
     * TODO: update to retrieve file paths
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.remove = async (req, res, next) => {

        try {
            const id = this.getId(req);

            // retrieve item data and create a file instance
            let fileData = await fserve.get(id);

            // check if node is valid (exists)
            if (!fileData)
                return next(new Error('notFound'));

            // create file metadata instance
            const item = new Model(fileData.metadata);
            let file = await cserve.createFile(item, fileData);

            // delete files
            const resData = await fserve.remove(file, fileData.url);
            if (resData) {
                return next(new Error('fileDeleteError'));
            }

            res.status(200).json(
                prepare({
                    view: 'remove',
                    model: model,
                    data: fileData,
                    message: {
                        msg: `'${fileData.label}' deleted successful!`,
                        type: 'success'
                    }
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
    };


    /**
     * Download files.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.download = async (req, res, next) => {

        try {

            // get requested file ID
            const fileID = this.getId(req);

            // get owner node; check that node exists in database
            // and corresponds to requested owner type.
            const file = await fserve.select(fileID);

            if (!file)
                return next(new Error('invalidRequest'));

            // get the source and destination path
            const src = fserve.getRawImgSrc(file.file_type, file)
            const dst = file.filename;

            console.log(src, dst)

            res.status(200).json(
                prepare({
                    view: 'download',
                    data: { src: src, dst: src },
                }));

            return
            // download file
            await fserve.download(src, dst);

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

            // get path of owner node in hierarchy
            const path = await nserve.getPath(file);

            // get station node
            const stationKey = Object.keys(path)
                .find(key => {
                    const {node={}} = path[key] || {};
                    const {type=''} = node || {};
                    return type === 'stations';
                });

            if (!stationKey)
                return next(new Error('invalidRequest'));

            const station = path[stationKey].node;

            // send form data response
            // - include possible historic images for alignment (mastering)
            res.status(200).json(
                prepare({
                    view: 'master',
                    model: model,
                    data: {
                        modern_capture: fileData,
                        historic_captures: await metaserve.getHistoricCapturesByStation(station, client)
                    },
                    path: path
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
    }
}

