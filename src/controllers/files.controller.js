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

import Busboy from 'busboy';
import { inspect } from 'util';
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

    this.init = async (req, res, next) => {

        // generate model constructor
        Model = await db.model.create(modelType);
        model = new Model();
        services = new ModelServices(new Model());

        // include image states (if needed)
        if (model.hasAttribute('image_state')) {
            const imageStates = await fserve.getImageStates();
            model.setOptions('image_state', imageStates);
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

        const busboy = new Busboy({ headers: req.headers });
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
            file.on('data', function(data) {
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });
            file.on('end', function() {
                console.log('File [' + fieldname + '] Finished');
            });
        });
        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
            console.log('Field [' + fieldname + ']: value: ' + inspect(val));
        });
        busboy.on('finish', function() {
            console.log('Done parsing form!');
            res.writeHead(303, { Connection: 'close' });
            res.end();
        });
        return req.pipe(busboy);

        // get linked data referenced in node tree
        return res.status(200).json(
            prepare({
                view: 'upload',
                model: model,
                data: {},
                path: {},
                message: {msg:'Files uploaded successfully!', type:'success'}
            }));

    };
}
