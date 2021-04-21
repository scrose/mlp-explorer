/*!
 * MLP.API.Controllers.Metadata
 * File: metadata.controller.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

import * as cserve from '../services/construct.services.js';
import * as nserve from '../services/nodes.services.js';
import * as metaserve from '../services/metadata.services.js';
import { prepare } from '../lib/api.utils.js';
import pool from '../services/db.services.js';
import { humanize, sanitize } from '../lib/data.utils.js';
import * as fserve from '../services/import.services.js';

/**
 * Shared data.
 *
 * @src public
 */

let Metadata, metadataModel;

/**
 * Export controller constructor.
 *
 * @param {String} metadataType
 * @src public
 */

export default function MetadataController(metadataType) {

    // check metadata type is not null
    if (!metadataType) throw new Error('invalidMetadataType');

    /**
     * Initialize the controller: generate services for model
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.init = async (req, res, next) => {
        try {
            Metadata = await cserve.create(metadataType);
            metadataModel = new Metadata();
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
        return req.params.hasOwnProperty(metadataModel.key)
            ? parseInt(req.params[metadataModel.key])
            : null;
    };
    this.getGroupType = function(req) {
        return req.params.hasOwnProperty('group_type')
            ? parseInt(req.params.group_type)
            : null;
    };

    /**
     * Get metadata options.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.settings = async (req, res, next) => {
        try {
            res.status(200).json(
                prepare({
                    view: 'settings',
                    data: await metaserve.getAllSettings()
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
    };

    /**
     * Get metadata options.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.options = async (req, res, next) => {
        try {
            res.status(200).json(
                prepare({
                    view: 'options',
                    data: await metaserve.getMetadataOptions()
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
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

            // get item metadata and filter through instance
            let data = await metaserve.select(sanitize(id, 'integer'), metadataModel);
            const item = new Metadata(data);

            // item record and/or node not found in database
            if (!item)
                return next(new Error('notFound'));

            res.status(200).json(
                prepare({
                    view: 'show',
                    data: item.getData(),
                    model: item
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            client.release(true);
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
            let ownerType = null;
            let ownerID = null;

            // get owner ID from parameters
            const { owner_id = null } = req.params || {};
            if (owner_id) {
                // set owner ID
                ownerID = owner_id;
                // get owner metadata record (if exists)
                const owner = await nserve.select(owner_id, client);
                // check owner exists
                if (!owner) return next(new Error('invalidRequest'));
                // update owner type
                ownerType = owner.type;
            }

            // filter metadata through importer
            // - saves any attached files to library
            // - collates metadata
            const mdData = await fserve.receive(req, ownerID, ownerType);

            let item = new Metadata(mdData.data);
            const data = await metaserve.insert(item, false);

            // send create response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: data,
                    message: {
                        msg: `${metadataModel.label} record created successfully!`,
                        type: 'success'
                    }
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            client.release();
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
            let ownerType = null;
            let ownerID = null;

            // get item ID from parameters
            const id = this.getId(req);
            // get item metadata
            const selectData = await metaserve.select(sanitize(id, 'integer'), metadataModel);

            // check relation exists for file type and node type
            if (!selectData)
                return next(new Error('invalidRequest'));
            // get owner node; check that node exists in database
            // and corresponds to requested owner type.
            const owner = await nserve.select(selectData.owner_id, client);
            if (owner) {
                ownerID = owner.id;
                ownerType = owner.type;
            }

            // create metadata item from request data
            const mdData = await fserve.receive(req, ownerID, ownerType);
            let item = new Metadata(mdData.data);

            // include requested ID / owner ID
            item.id = id;
            item.owner = ownerID;

            // do the record update
            const data = await metaserve.update(item, metadataModel);

            // send create response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: data,
                    message: {
                        msg: `${metadataModel.label} record updated successfully!`,
                        type: 'success'
                    }
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

            // get owner ID from parameters (if exists)
            const id = this.getId(req);
            // get item metadata
            const selectData = await metaserve.select(sanitize(id, 'integer'), metadataModel);
            // check relation exists for file type and node type
            if (!selectData)
                return next(new Error('invalidRequest'));
            // retrieve item data
            let item = new Metadata(selectData);
            // delete the item
            const data = await metaserve.remove(item);

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: data,
                    message: {
                        msg: `${metadataModel.label} record deleted successfully!`,
                        type: 'success'
                    }
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
    };

    /**
     * Insert grouped records.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.createGroup = async (req, res, next) => {

        const client = await pool.connect();

        try {

            // TODO: Generalize item id key for other possible group types.
            const idKey = 'participant_id';
            // get owner ID from parameters
            const { owner_id = null } = req.params || {};
            // get owner metadata record
            const owner = await nserve.select(sanitize(owner_id, 'integer'), client);
            // check owner exists
            if (!owner) return next(new Error('invalidRequest'));
            // filter metadata through importer
            // - saves any attached files to library
            // - collates metadata
            const mdData = await fserve.receive(req, owner.id, owner.type);

            // Handle Groups
            // - creates new group for participants sent in request
            // - adds participants to existing groups
            const {group_type='', participants=[]} = mdData.data || {};
            let items = Object.keys(participants).map(key => {
                const itemID = participants[key];
                return {
                    [idKey]: itemID,
                    owner_id: owner.id,
                    group_type: group_type
                };
            });
            let data = await metaserve.updateGroup(items, metadataModel.name, owner.id, group_type);

            // send create response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: data,
                    message: {
                        msg: `${metadataModel.label}: ${humanize(group_type)} created successfully!`,
                        type: 'success'
                    }
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            client.release();
        }
    };

    /**
     * Update grouped records.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.updateGroup = async (req, res, next) => {

        const client = await pool.connect();

        try {

            // get item ID from parameters
            const id = this.getId(req);
            // TODO: Generalize item id key for other possible group types.
            const idKey = 'participant_id';
            // get item metadata
            const selectData = await metaserve.select(sanitize(id, 'integer'), metadataModel);
            // check relation exists for file type and node type
            if (!selectData) return next(new Error('invalidRequest'));
            // get owner node; check that node exists in database
            // and corresponds to requested owner type.
            const owner = await nserve.select(selectData.owner_id, client);
            // create metadata item from request data
            const mdData = await fserve.receive(req, owner.id, owner.type);

            // update all items in group
            const { group_type='' } = mdData.data || {};
            const groupData = group_type ? mdData.data[group_type] : [];
            let items = Object.keys(groupData).map(key => {
                const itemID = groupData[key];
                return {
                    [idKey]: itemID,
                    owner_id: owner.id,
                    group_type: group_type
                };
            });
            const data = await metaserve.updateGroup(
                items,
                metadataModel.name,
                owner.id,
                group_type,
                idKey);

            // send create response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: data,
                    message: {
                        msg: `${metadataModel.label}: ${humanize(group_type)} updated successfully!`,
                        type: 'success'
                    }
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            client.release();
        }
    };

    /**
     * Delete grouped records.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.removeGroup = async (req, res, next) => {
        try {

            // get owner ID & group type from parameters
            const ownerID = this.getId(req);
            const groupType = this.getGroupType(req);

            // get owner metadata
            const ownerData = await metaserve.select(sanitize(ownerID, 'integer'), metadataModel);

            // check relation exists for file type and node type
            if (!ownerData)
                return next(new Error('invalidRequest'));

            // remove the grouped metadata
            let data = await metaserve.removeGroup(ownerID, metadataType, groupType);

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: data,
                    message: {
                        msg: `${metadataModel.label} group deleted successfully!`,
                        type: 'success'
                    }
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
    };

}