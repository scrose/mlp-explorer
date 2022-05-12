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
import { sanitize } from '../lib/data.utils.js';
import * as importer from '../services/import.services.js';
import { humanize } from '../lib/data.utils.js';
import path from "path";
import { getFilePath } from '../services/files.services.js';

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
            await client.release(true);
        }
    };


    /**
     * Retrieves files using ID array filter.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.filter = async (req, res, next) => {

        try {

            // get query parameters
            const { ids='', offset=0, limit=10 } = req.query || {};

            // sanitize + convert query string to node id array
            const fileIDs = ids
                .split(' ')
                .map(id => {
                    return sanitize(id, 'integer');
                });

            // get filtered results
            const resultData = await fserve.filterFilesByID(fileIDs, offset, limit);

            res.status(200).json(
                prepare({
                    view: 'filter',
                    data: resultData
                }));

        } catch (err) {
            return next(err);
        }
    };


    /**
     * Upload files and metadata.
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
            const { type='' } = owner || {};

            // filter metadata through importer
            // - saves attached files to library
            // - collates input metadata (applies to all files)
            const received = await importer.receive(req, owner_id, type);

            // check if files are present in request data
            if (Object.keys(received.files).length === 0) {
                return next(new Error('invalidRequest'));
            }

            // save file(s) and insert file metadata
            const resData = await fserve.insert(received, model.name, owner);

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: resData[0],
                    message: {
                        msg: `${resData.length} ${model.label || humanize(modelType)} created successfully!`,
                        type: 'success'
                    },
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            await client.release(true);
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

            // check that file entry exists
            if (!fileData) {
                return next(new Error('notFound'));
            }

            // get path of owner node in hierarchy
            const { file = null } = fileData || {};
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
        } finally {
            await client.release(true);
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
            });

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
            await client.release(true);
        }
    };

    /**
     * Delete single file and file metadata.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.remove = async (req, res, next) => {

        const client = await pool.connect();

        try {
            const id = this.getId(req);

            // retrieve item data and create a file instance
            let file = await fserve.get(id, client);

            // check if node is valid (exists)
            if (!file) return next(new Error('notFound'));

            // delete file + file model metadata
            const result = await fserve.remove(file);

            res.status(200).json(
                prepare({
                    view: 'remove',
                    model: model,
                    data: result,
                    message: {
                        msg: `'${fileData.label}' deleted successful!`,
                        type: 'success'
                    }
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            await client.release(true);
        }
    };


    /**
     * Download files (for unauthenticated downloads).
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.download = async (req, res, next) => {

        const client = await pool.connect();

        try {

            // get requested file ID
            const fileID = this.getId(req);

            // get owner node; check that node exists in database
            // and corresponds to requested owner type.
            const fileData = await fserve.get(fileID, client);
            const { file={}, metadata={} } = fileData || {};
            const { file_type={} } = file || {};

            if (!file) return next(new Error('invalidRequest'));

            // get the file path for download
            const filePath = getFilePath(file_type, file, metadata);

            res.download(filePath);

        } catch (err) {
            return next(err);
        } finally {
            await client.release(true);
        }
    };

    /**
     * Download bulk files (compressed folder downloads).
     *
     * @param req
     * @param res
     * @param next
     * @src public
     * TODO: Complete bulk download feature
     */

    // this.exporter = async (req, res, next) => {
    //
    //     const client = await pool.connect();
    //
    //     try {
    //
    //         // get requested file ID
    //         const fileID = this.getId(req);
    //
    //         // get owner node; check that node exists in database
    //         // and corresponds to requested owner type.
    //         const fileData = await fserve.get(fileID, client);
    //         const { file={}, metadata={} } = fileData || {};
    //         const { file_type={} } = file || {};
    //
    //         if (!file) return next(new Error('invalidRequest'));
    //
    //         // get the file path for download
    //         const filePath = getFilePath(file_type, file, metadata);
    //
    //         res.download(filePath);
    //
    //     } catch (err) {
    //         return next(err);
    //     } finally {
    //         client.release(true);
    //     }
    // };


    /**
     * Download files (for authenticated downloads).
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.raw = async (req, res, next) => {

        const client = await pool.connect();

        try {

            // get requested file ID
            const fileID = this.getId(req);

            // get owner node; check that node exists in database
            // and corresponds to requested owner type.
            const fileData = await fserve.get(fileID, client);
            const { file={} } = fileData || {};

            if (!file) return next(new Error('invalidRequest'));

            const { fs_path={} } = file || {};
            res.download(path.join(process.env.UPLOAD_DIR, fs_path));

        } catch (err) {
            return next(err);
        } finally {
            await client.release(true);
        }
    };


}

