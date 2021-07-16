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

import { prepare } from '../lib/api.utils.js';
import pool from '../services/db.services.js';
import ModelServices from '../services/model.services.js';
import * as cserve from '../services/construct.services.js';
import * as nserve from '../services/nodes.services.js';
import * as fserve from '../services/files.services.js';
import * as importer from '../services/import.services.js';
import * as metaserve from '../services/metadata.services.js';
import { sanitize, humanize } from '../lib/data.utils.js';
import { isRelatable } from '../services/schema.services.js';
import {updateComparisons} from "../services/comparisons.services.js";

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

    this.getId = function(req) {
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

            // get item node + metadata
            let itemData = await nserve.get(sanitize(id, 'integer'), client);

            // item record and/or node not found in database
            if (!itemData)
                return next(new Error('notFound'));

            // get node path
            const path = await nserve.getPath(itemData.node);

            // append second-level dependents (if node depth is above threshold)
            if (model.depth > 1) {
                itemData.dependents = await Promise.all(
                    itemData.dependents.map(async (dependent) => {
                        const { node = {} } = dependent || {};
                        dependent.dependents = await nserve.selectByOwner(node.id, client);
                        dependent.attached = await metaserve.getAttachedByNode(node, client);
                        return dependent;
                    }));
            }

            // include attached metadata
            itemData.attached = await metaserve.getAttachedByNode(itemData.node, client);

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: itemData,
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
            let { owner_id = 0 } = req.params || {};

            // create model instance
            const item = owner_id
                ? new Model({ owner_id: owner_id })
                : new Model();

            // get path of node in hierarchy
            const owner = await nserve.select(sanitize(owner_id, 'integer'));
            const path = await nserve.getPath(owner) || {};

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
            const { owner_id = null } = req.params || {};
            // get owner metadata record
            const owner = await nserve.select(owner_id, client);
            // check owner exists
            if (!owner && !model.isRoot) return next(new Error('invalidRequest'));
            // get owner type (null owner use current model name)
            const { type = model.name } = owner || {};

            // filter metadata through importer
            // - saves any attached files to library
            // - collates metadata
            const importData = await importer.receive(req, owner_id, type);

            // check if files are present
            const hasFiles = Object.keys(importData.files).length > 0;

            // insert metadata with/without file uploads
            // - Option (A) import: use importer to save file stream data and insert file metadata
            // - Option (B) insert: upload metadata only
            const resData = hasFiles
                ? await fserve.insert(importData, model.name)
                : await mserve.insert(new Model(importData.data));

            // get ID for new item
            const { nodes_id = null } = resData || {}
            const newItem = nodes_id ? await nserve.get(nodes_id) : {};
            const label = `${nodes_id ? newItem.label : model.label}`;

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: nodes_id ? newItem : resData,
                    message: {
                        msg: `'${label}' ${humanize(model.name)} created successfully!`,
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
        try {

            // get node ID from parameters
            const id = this.getId(req);

            // get item data
            let data = await nserve.get(id);

            // get path of node in hierarchy
            const owner = await nserve.select(id);
            const path = await nserve.getPath(owner) || {};

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
            const itemData = await nserve.get(id);

            // check that file entry exists
            if (!itemData) {
                return next(new Error('invalidRequest'));
            }

            // process imported metadata
            const {node={}, metadata={}} = itemData || {};
            const {owner_id='', owner_type=''} = node || {};
            const importedData = await importer.receive(req, owner_id, owner_type);

            // create model instance and inject data
            const item = new Model(metadata);
            item.setData(importedData.data);

            // update database record
            await mserve.update(item);

            // capture metadata? check for any dependent updates
            if (node.type === 'historic_captures' || node.type === 'modern_captures') {
                const {data = {}} = importedData || {};
                const {historic_captures = {}, modern_captures = {}} = data || {};
                const comparisonCaptures = node.type === 'historic_captures'
                    ? Object.values(modern_captures) : Object.values(historic_captures);
                await updateComparisons(node, comparisonCaptures, client);
            }

            // get updated item
            let updatedItem = await nserve.get(id);

            // create node path
            const path = await nserve.getPath(node);

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: updatedItem,
                    path: path,
                    message: {
                        msg: `'${updatedItem.label}' ${humanize(model.name)} updated successfully!`,
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
     * Move item to new owner.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.move = async (req, res, next) => {

        const client = await pool.connect();

        try {

            // get node data from parameters
            const id = this.getId(req);
            const itemData = await nserve.get(id);

            // check that file entry exists
            if (!itemData) {
                return next(new Error('invalidRequest'));
            }

            // process imported metadata
            const {owner_id=''} = req.body || {};
            const ownerData = await nserve.select(owner_id);

            // reject if owner does not exist
            if (!ownerData) {
                return next(new Error('invalidRequest'));
            }

            // is the move allowed? (i.e. check if the owner and node relatable)
            const isMoveable = await isRelatable(id, owner_id, client);
            if (!isMoveable) {
                return next(new Error('invalidMove'));
            }

            const item = new Model(itemData.metadata);

            // send response
            return res.status(200).json(
                prepare({
                    view: 'show',
                    model: model,
                    data: await isRelatable(id, owner_id),
                    message: {
                        msg: `${humanize(model.name)} moved successfully!`,
                        type: 'success'
                    },
                }));
            //
            // // update database record
            // await mserve.update(item);
            //
            // // get updated item
            // let updatedItem = await nserve.get(id);
            //
            // // create node path
            // const path = await nserve.getPath(node);
            //
            // // send response
            // res.status(200).json(
            //     prepare({
            //         view: 'show',
            //         model: model,
            //         data: updatedItem,
            //         path: path,
            //         message: {
            //             msg: `'${updatedItem.label}' ${humanize(model.name)} updated successfully!`,
            //             type: 'success'
            //         },
            //     }));

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
            let nodeData = await nserve.get(id);
            // check if node is valid (exists)
            if (!nodeData)
                return next(new Error('notFound'));
            const item = new Model(nodeData.metadata);

            // get path of owner node in hierarchy (if exists)
            const { owner_id = null } = item.node || {};
            const owner = await nserve.select(owner_id);
            const path = await nserve.getPath(owner);

            // delete item
            await mserve.remove(item);

            res.status(200).json(
                prepare({
                    view: 'remove',
                    model: model,
                    data: nodeData,
                    message: {
                        msg: `'${nodeData.label}' ${humanize(model.name)} deleted successful!`,
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