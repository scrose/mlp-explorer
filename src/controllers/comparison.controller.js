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
import { isComparable, upsertComparison, getComparisonsByCapture } from '../services/comparisons.services.js';

export default function ComparisonController() {

    /**
     * Initialize the controller.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.init = async () => {};

    /**
     * Get comparison capture data for given capture ID.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.select = async (req, res, next) => {

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {

            // get parent node ID and type from parameters
            const parentID = req.params.id;

            // message
            let msg = null;

            // init captures available / selected for given capture
            let availableCaptures = null;
            let selectedCaptures = null;

            // get parent node data
            const parentData = await nserve.get(parentID, client);
            const { node = {} } = parentData || {};

            // does the parent node exist?
            if (!node.hasOwnProperty('type'))
                return next(new Error('invalidRequest'));
            // is it a valid sorted parent?
            if ( node.type !== 'historic_visits' && node.type !== 'locations' )
                return next(new Error('invalidComparison'));

            // get path of owner node in hierarchy
            const path = await nserve.getPath(node);

            // get station node from capture
            const stationKey = Object.keys(path)
                .find(key => {
                    const {node={}} = path[key] || {};
                    const {type=''} = node || {};
                    return type === 'stations';
                });

            // Station found: include available capture data
            const  {type='' } = node || {};
            if (stationKey) {
                const station = path[stationKey].node;
                // get captures available for comparison
                availableCaptures = type === 'modern_captures'
                    ? await metaserve.getHistoricCapturesByStation(station, client)
                    : await metaserve.getModernCapturesByStation(station, client);

                // get captures available for comparison
                availableCaptures = await Promise.all(
                    (availableCaptures || [])
                        .map(async (capture) => {
                            return await nserve.get(capture.nodes_id, client);
                        })
                );

                // get captures already selected for comparison
                selectedCaptures = await Promise.all(
                    (availableCaptures || [])
                        .map(async (capture) => {
                            const { node={}} = capture || {};
                            return await getComparisonsByCapture(node, client) || [];
                        })
                );
                // reduce selected captures to array of node IDs
                selectedCaptures = selectedCaptures.reduce((o, captures) => {
                    // const captureIDs = captures.map(capture => {
                    //     return type === 'modern_captures' ? capture.historic_captures : capture.modern_captures;
                    // });
                    o.push(...captures);
                    return o;
                }, []);

                // filter null entries
                selectedCaptures = selectedCaptures.filter(capture => {
                    return capture != null && capture !== 'null'
                });

                // send form data response
                // - include possible historic images for alignment (mastering)
                res.status(200).json(
                    prepare({
                        view: 'compare',
                        message: msg,
                        data: {
                            available: availableCaptures,
                            selected: selectedCaptures
                        },
                        path: path
                    }));

            }
            // Station not found: invalid mastering
            // - respond with master data
            else {
                return next(new Error('invalidComparison'));
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
     * Get capture images for given capture image.
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

            // get node ID and type from parameters
            const id = req.params.id;
            const type = req.params.type;

            // message
            let msg = null;

            // init captures available
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
                            return await nserve.get(capture.id, client);
                        })
                );

                // send form data response
                // - include possible historic images for alignment (mastering)
                res.status(200).json(
                    prepare({
                        view: 'register',
                        model: type,
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
            if (!await isComparable(historicCapture, modernCapture, client)) {
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
            const historicFilename = files[0].file.filename;
            const modernFilename = files[1].file.filename;

            // insert comparisons record
            const resCompare = await upsertComparison(historic_capture, modern_capture);

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
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

