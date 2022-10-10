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
import {humanize, sanitize} from '../lib/data.utils.js';
import * as fserve from '../services/import.services.js';
import {getParticipantGroupTypes} from "../services/schema.services.js";
import {getGroupParticipants} from "../services/metadata.services.js";


/**
 * Export controller constructor.
 *
 * @param {String} metadataType
 * @src public
 */

export default function MetadataController(metadataType) {

    /**
     * Shared data.
     *
     * @src public
     */

    let Metadata, metadataModel;

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
    this.getOwnerId = function(req) {
        return req.params.hasOwnProperty('owner_id')
            ? parseInt(req.params['owner_id'])
            : null;
    };
    this.getGroupType = function(req) {
        return req.params.hasOwnProperty('group_type')
            ? req.params['group_type']
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
        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {
            res.status(200).json(
                prepare({
                    view: 'options',
                    data: await metaserve.getMetadataOptions(client)
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        }
        finally {
            await client.release(true);
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
            let data = await metaserve.select(sanitize(id, 'integer'), metadataModel, client);
            const item = new Metadata(data);

            // item record and/or node not found in database
            if (!item) return next(new Error('notFound'));

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
            const ownerID = this.getOwnerId(req);
            let ownerType = null;

            // get owner ID from parameters
            if (ownerID) {
                // get owner metadata record (if exists)
                const owner = await nserve.select(ownerID, client);
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
            const data = await metaserve.insert(item, false, client);

            // send create response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: data,
                    message: {
                        msg: `${metadataModel.label || humanize(metadataType)} record created successfully!`,
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
            const selectData = await metaserve.select(sanitize(id, 'integer'), metadataModel, client);

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
            const data = await metaserve.update(item, metadataModel, client);

            // send create response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: data,
                    message: {
                        msg: `${metadataModel.label || humanize(metadataType)} record updated successfully!`,
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

            // get owner ID from parameters (if exists)
            const id = this.getId(req);
            // get item metadata
            const selectData = await metaserve.select(sanitize(id, 'integer'), metadataModel, client);
            // check relation exists for file type and node type
            if (!selectData)
                return next(new Error('invalidRequest'));
            // retrieve item data
            let item = new Metadata(selectData);
            // delete the item
            const data = await metaserve.remove(item, client);

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: data,
                    message: {
                        msg: `${metadataModel.label || humanize(metadataType)} record deleted successfully!`,
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
     * Show grouped metadata.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.showGroup = async (req, res, next) => {

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {

            // get requested node ID
            // get owner ID & group type from parameters
            const ownerID = this.getOwnerId(req);
            const groupType = this.getGroupType(req);

            // get item metadata and filter through instance
            let metadata = await metaserve.selectByOwner(sanitize(ownerID, 'integer'), metadataType, client);

            // metadata record not found in database
            if (!metadata || !ownerID || !groupType ) return next(new Error('notFound'));

            // retrieve participants for group (delete participant_id property for first pgrp record)
            const participants = await metaserve.getGroupParticipants(ownerID, groupType, client);

            // map participant metadata to value/label pairs
            res.status(200).json(
                prepare({
                    view: 'show',
                    data: {metadata: {
                        id: ownerID,
                        group_type: groupType,
                        [groupType]: participants.map(participant => {
                            return {
                                value: participant.id,
                                label: participant.full_name,
                            };
                        })
                    }},
                    model: new Metadata(metadata)
                }));

        } catch (err) {
            console.error(err)
            return next(err);
        } finally {
            await client.release(true);
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

            // get owner ID from parameters
            const ownerID = this.getOwnerId(req);
            const idKey = 'participant_id';

            // get owner metadata record
            const owner = await nserve.select(sanitize(ownerID, 'integer'), client);

            // check owner exists
            if (!owner) return next(new Error('invalidRequest'));

            // filter request through importer
            const inputMetadata = await fserve.receive(req, owner.id, owner.type);
            const {participants=[], group_type=''} = inputMetadata.data || {};

            // validate group type
            const groupTypes = await getParticipantGroupTypes(client);
            if (!groupTypes.includes(group_type)) return next(new Error('invalidGroupType'));

            // confirm group does not already exist
            const group = await getGroupParticipants(ownerID, group_type, client);
            if (Array.isArray(group) && group.length > 0) return next(new Error('invalidRequest'));

            // Create participant group
            // - creates new group for participants sent in request
            // - adds participants to existing groups
            let newParticipants = Object.keys(participants).map(key => {
                const itemID = participants[key];
                return {
                    [idKey]: itemID,
                    owner_id: ownerID,
                    group_type: group_type
                };
            });
            let data = await metaserve.updateGroup(newParticipants, metadataModel.name, owner.id, group_type);

            // send create response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: data,
                    message: {
                        msg: `${metadataModel.label || humanize(metadataType)}: ${humanize(group_type)} created successfully!`,
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
            // get owner ID & group type from parameters
            const ownerID = this.getOwnerId(req);
            const groupType = this.getGroupType(req);
            const idKey = 'participant_id';

            // get owner metadata records
            const owner = await nserve.select(sanitize(ownerID, 'integer'), client);
            if (!owner) return next(new Error('invalidRequest'));

            // validate group type
            const groupTypes = await getParticipantGroupTypes(client);
            if (!groupTypes.includes(groupType)) return next(new Error('invalidGroupType'));

            // filter request data through importer
            const inputMetadata = await fserve.receive(req, ownerID, owner.type);
            if (!inputMetadata.data.hasOwnProperty(groupType)) return next(new Error('invalidRequest'));

            // Filter participant IDs for requested participant group
            // - creates new group for participants sent in request
            // - adds participants to existing group
            let newParticipants = Object.keys(inputMetadata.data[groupType]).map(key => {
                const itemID = inputMetadata.data[groupType][key];
                return {
                    [idKey]: itemID,
                    owner_id: ownerID,
                    group_type: groupType
                };
            });

            // console.log('Update Group', owner, groupType, inputMetadata, newParticipants)

            // update group with participants for group
            const result = await metaserve.updateGroup(newParticipants, metadataType, ownerID, groupType, idKey);

            // send create response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: result,
                    message: {
                        msg: `${metadataModel.label || humanize(metadataType)}: ${humanize(groupType)} updated successfully!`,
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
     * Delete grouped records by owner ID.
     *
     * @param req
     * @param res
     * @param next
     * @src public
     */

    this.removeGroup = async (req, res, next) => {
        const client = await pool.connect();
        try {

            // get owner ID & group type from parameters
            const ownerID = this.getOwnerId(req);
            const groupType = this.getGroupType(req);

            // check that owner exists
            if (!await metaserve.selectByOwner(sanitize(ownerID, 'integer'), metadataType, client))
                return next(new Error('invalidRequest'));

            // validate group type
            const groupTypes = await getParticipantGroupTypes(client);
            if (!groupTypes.includes(groupType)) return next(new Error('invalidGroupType'));

            // remove all participants in group
            await metaserve.updateGroup([], metadataModel.name, ownerID, groupType, 'participant_id');

            // remove the group
            let data = await metaserve.removeGroup(ownerID, metadataType, groupType, client);

            // send response
            res.status(200).json(
                prepare({
                    view: 'show',
                    model: metadataModel,
                    data: data,
                    message: {
                        msg: `${metadataModel.label || humanize(groupType)} group deleted successfully!`,
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

}