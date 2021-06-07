/*!
 * MLP.API.Controllers.Master
 * File: master.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import * as fserve from '../services/files.services.js';
import * as nserve from '../services/nodes.services.js';
import { prepare } from '../lib/api.utils.js';
import pool from '../services/db.services.js';
import * as metaserve from '../services/metadata.services.js';
import * as importer from '../services/import.services.js';
import { isCompatiblePair, addComparison } from '../services/comparisons.services.js';
import * as db from '../services/index.services.js';
import ModelServices from '../services/model.services.js';

/**
 * Export controller constructor.
 *
 * @param {String} model
 * @src public
 */

let Model, model, mserve;

export default function MasterController(modelType) {

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
     * Get image data for registration -> mastering.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.register = async (req, res, next) => {

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {

            // get node ID from parameters
            const id = this.getId(req);

            // message
            let msg = null;

            // init capture images available
            let captures = null;

            // get file data
            const fileData = await fserve.get(id, client);
            const { file = null } = fileData || {};

            if (!file) return next(new Error('invalidRequest'));

            const { file_type='' } = file || {};

            // get path of owner node in hierarchy
            const path = await nserve.getPath(file);

            // get station node
            const stationKey = Object.keys(path)
                .find(key => {
                    const {node={}} = path[key] || {};
                    const {type=''} = node || {};
                    return type === 'stations';
                });

            // Station found: include available capture data
            if (stationKey) {
                const station = path[stationKey].node;
                captures = file_type === 'modern_images'
                    ? await metaserve.getHistoricCapturesByStation(station, client)
                    : await metaserve.getModernCapturesByStation(station, client)

                // append file data
                const captureData = await Promise.all(
                    (captures || [])
                        // .filter(comparison => comparison)
                        .map(async (capture) => {
                            return await nserve.get(capture.id);
                        })
                );

                // send form data response
                // - include possible historic images for alignment (mastering)
                res.status(200).json(
                    prepare({
                        view: 'master',
                        model: model,
                        message: msg,
                        data: captureData,
                        path: path
                    }));

            }
            // Station not found: invalid mastering
            // - respond with master data
            else {
                return next(new Error('invalidMaster'));
            }

        } catch (err) {
            console.error(err)
            return next(err);
        }
        finally {
            client.release(true);
        }
    }

    /**
     * Upload image data as mastered.
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

            const received = await importer.receive(req);

            // extract capture data
            const { data=null, files={} } = received || {};
            const { historic_capture=null, modern_capture=null } = data || {};

            // [1] handle historic image
            // get historic image file metadata
            const historicCapture = await nserve.select(historic_capture, client);
            const modernCapture = await nserve.select(modern_capture, client);

            // check if captures exist and files are present in request data
            if (!historicCapture || !modernCapture || Object.keys(received.files).length < 2 ) {
                return next(new Error('invalidRequest'));
            }

            // check that image pair share a common station
            if (!await isCompatiblePair(historicCapture, modernCapture, client)) {
                return next(new Error('invalidMaster'));
            }

            // save files separately and insert file metadata
            const historicData = {
                files: {'0': files[0]},
                data: {image_state: 'master'}
            }
            const resDataHistoric = await fserve.insert(
                historicData, 'historic_images', historicCapture);

            const modernData = {
                files: {'0': files[1]},
                data: {image_state: 'master'}
            }
            const resDataModern = await fserve.insert(
                modernData, 'modern_images', modernCapture);

            // error in insert
            if (!Array.isArray(resDataHistoric) || !Array.isArray(resDataModern)) {
                return next(new Error('invalidMaster'));
            }

            // extract files ID and filenames
            const historicFileID = resDataHistoric[0].file.id;
            const historicFilename = files[0].file.filename;
            const modernFileID = resDataModern[0].file.id;
            const modernFilename = files[1].file.filename;

            // insert comparisons record
            const resCompare = await addComparison(
                historicFileID, historic_capture, modernFileID, modern_capture);

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: resCompare,
                    message: {
                        msg: `'${historicFilename}' and '${modernFilename} mastered successfully!`,
                        type: 'success'
                    },
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            client.release();
        }
    }
}

