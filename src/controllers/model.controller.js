/*!
 * MLP.API.Controllers.Model
 * File: model.controller.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Controller for MLP node model data processing.
 *
 * ---------
 * Revisions
 */

/**
 * Module dependencies.
 * @private
 */

import pool from '../services/db.services.js';
import ModelServices from '../services/model.services.js';
import * as cserve from '../services/construct.services.js';
import * as nserve from '../services/nodes.services.js';
import * as fserve from '../services/files.services.js';
import * as importer from '../services/import.services.js';
import * as metaserve from '../services/metadata.services.js';
import {humanize, sanitize} from '../lib/data.utils.js';
import {isRelatable} from '../services/schema.services.js';
import {deleteComparisons, getComparisonsMetadata, updateComparisons} from "../services/comparisons.services.js";
import {prepare} from '../lib/api.utils.js';

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
     * Shared data.
     *
     * @src public
     */

    let Model, model, mserve;

    /**
     * Initialize the controller: generate services for model
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.init = async () => {
        try {
            Model = await cserve.create(nodeType);
            model = new Model();
            mserve = new ModelServices(model);
        }
        catch (err) {
            return next(err);
        }
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
            let id = this.getId(req);

            // get item node + metadata
            let itemData = await nserve.get(id, nodeType, client);
            const {type=''} = itemData || {};

            // item record and/or node not found in database
            if (!itemData || nodeType !== type) return next(new Error('notFound'));

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
            await client.release(true);
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
        const client = await pool.connect();
        try {

            // get owner ID from parameters (if exists)
            let { owner_id = 0 } = req.params || {};

            // create model instance of owner
            const item = owner_id ? new Model({ owner_id: owner_id }) : new Model();

            // get path of node in hierarchy
            const owner = await nserve.select(sanitize(owner_id, 'integer'), client);
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
        } finally {
            await client.release(true);
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
            // const { type = model.name } = owner || {};
            const { type = null } = owner || {};

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
            const newItem = nodes_id ? await nserve.get(nodes_id, nodeType, client) : {};
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
            await client.release(true);
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
        const client = await pool.connect();
        try {

            // get node ID from parameters
            const id = this.getId(req);

            // get item data
            let itemData = await nserve.get(id, nodeType, client);

            // item record and/or node not found in database
            const {type=''} = itemData || {};
            if (!itemData || nodeType !== type) return next(new Error('notFound'));

            // get path of node in hierarchy
            const owner = await nserve.select(id, client);
            const path = await nserve.getPath(owner) || {};

            // send form data response
            res.status(200).json(
                prepare({
                    view: 'edit',
                    model: model,
                    data: itemData,
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
            const itemData = await nserve.get(id, nodeType, client);

            // item record and/or node not found in database
            if (!itemData) return next(new Error('notFound'));

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
            let updatedItem = await nserve.get(id, nodeType, client);

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
            await client.release(true);
        }
    };

    /**
     * Move capture to new container (owner).
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.move = async (req, res, next) => {
        const client = await pool.connect();
        try {

            // get dependent node + owner data
            const id = this.getId(req);
            const { owner_id=null } = req.params || {};
            const itemData = await nserve.get(id, nodeType, client);
            const ownerData = await nserve.select(owner_id, client);

            // item record and/or node/owner not found in database
            const {type='', status='', node} = itemData || {};
            if (!ownerData || !itemData || nodeType !== type) return next(new Error('notFound'));

            // is the move allowed? (i.e. check if owner and node are relatable or not repeated)
            // - confirm nodes can be put into requested relation (e.g., modern capture in location)
            // - confirm capture does not have comparisons.
            const comparisons = await getComparisonsMetadata(node, client);
            const isMoveable = await isRelatable(id, owner_id, client);

            if (Array.isArray(comparisons) && comparisons.length > 0)
                return next(new Error('restrictedByComparisons'));
            if (!isMoveable) {
                return next(new Error('invalidMove'));
            }
            if (status !== 'unsorted' && status !== 'sorted' && status !== 'missing') {
                return next(new Error('invalidMove'));
            }

            // create model instance and inject data (update new owner)
            const { metadata={} } = itemData || {};
            const item = new Model(metadata);

            // move item and dependents to new owner
            const result = await mserve.move(item, ownerData, client);

            // error occurred in capture image transfer
            if (!result) return next(new Error('invalidRequest'));

            // send response
            return res.status(200).json(
                prepare({
                    view: 'show',
                    model: itemData.type,
                    data: itemData,
                    message: {
                        msg: `${humanize(itemData.type)} moved successfully!`,
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
     * Delete record.
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

            // retrieve item data
            let itemData = await nserve.get(id, nodeType, client);

            // item record and/or node/owner not found in database
            const {type='', node} = itemData || {};
            if (!itemData || nodeType !== type) return next(new Error('notFound'));

            // check if node is valid (exists)
            if (!itemData) return next(new Error('notFound'));

            // force user to delete dependent nodes separately
            // - use error code 23503 from FK violation
            if (itemData.hasDependents) return next(new Error('23503'));

            // delete any capture comparisons if they exist
            const comparisons = await getComparisonsMetadata(node, client);
            if (Array.isArray(comparisons) && comparisons.length > 0) {
                await deleteComparisons(node, client);
            }

            // get path of owner node in hierarchy (if exists)
            const item = new Model(itemData.metadata);
            const { owner_id = null } = item.node || {};
            const owner = await nserve.select(owner_id, client);
            const path = await nserve.getPath(owner);

            // delete item (and attached files, if they exist)
            await mserve.remove(item, client);

            res.status(200).json(
                prepare({
                    view: 'remove',
                    model: model,
                    data: itemData,
                    message: {
                        msg: `'${itemData.label}' ${humanize(model.name)} deleted successful!`,
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
}