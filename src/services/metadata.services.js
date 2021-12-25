/*!
 * MLP.API.Services.Metadata
 * File: metadata.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import pool from './db.services.js';
import queries from '../queries/index.queries.js';
import {groupBy, sanitize} from '../lib/data.utils.js';
import * as cserve from './construct.services.js';
import * as fserve from './files.services.js';
import {getComparisonsByCapture, getComparisonsByStation, getComparisonsMetadata} from './comparisons.services.js';

/**
 * Get metadata by ID. Returns single metadata object.
 *
 * @public
 * @param {String} id
 * @param {String} model
 * @param client
 * @return {Promise} result
 */

export const select = async (id, model, client=pool) => {
    if (!id) return null;
    let { sql, data } = queries.metadata.select(sanitize(id, 'integer'), model);
    let metadata = await client.query(sql, data);
    return metadata.hasOwnProperty('rows') && metadata.rows.length > 0
        ? metadata.rows[0]
        : null;
};

/**
 * Get metadata by name. Returns single metadata object.
 *
 * @public
 * @param {String} model
 * @param value
 * @param client
 * @return {Promise} result
 */

export const selectByName = async (model, value, client=pool) => {
    let { sql, data } = queries.defaults.selectByField(model, 'name', value, 'varchar');
    let metadata = await client.query(sql, data);
    return metadata.hasOwnProperty('rows') && metadata.rows.length > 0
        ? metadata.rows[0]
        : null;
};

/**
 * Get metadata by Owner ID. Returns list of metadata objects.
 *
 * @public
 * @param {String} id
 * @param {String} model
 * @param client
 * @return {Promise} result
 */

export const selectByOwner = async (id, model, client=pool) => {
    if (!id) return null;
    let { sql, data } = queries.defaults.selectByOwner(sanitize(id, 'integer'), model);
    let metadata = await client.query(sql, data);
    return metadata.hasOwnProperty('rows') && metadata.rows.length > 0
        ? metadata.rows
        : null;
};

/**
 * Get grouped metadata.
 *
 * @public
 * @param {String} ownerID
 * @param {String} modelType
 * @param {String} groupType
 * @param client
 * @return {Promise} result
 */

export const getGroup = async function(
    ownerID,
    modelType,
    groupType,
    client = pool) {
    let { sql, data } = queries.defaults.getGroup(ownerID, modelType, groupType);
    let items = await client.query(sql, data);
    return items.rows;
};

/**
 * Insert metadata entry for provided instance.
 *
 * @param {Object} item
 * @param {Boolean} upsert
 * @param client
 * @return {Function} query function / null if no node
 * @public
 */

export const insert = async(item, upsert=false, client=pool) => {
    let { sql, data } = queries.metadata.insert(item, upsert);
    let response = await client.query(sql, data);
    return response.hasOwnProperty('rows') && response.rows.length > 0
        ? response.rows[0]
        : null;
}

/**
 * Update metadata entry for given item
 *
 * @param {Object} item
 * @param {String} model
 * @param client
 * @return {Function} query function / null if no node
 * @public
 */

export const update = async(item, model, client=pool) => {
    let { sql, data } = queries.metadata.update(item);
    let response = await client.query(sql, data);
    return response.hasOwnProperty('rows') && response.rows.length > 0
        ? response.rows[0]
        : null;
}

/**
 * Update batched metadata entries.
 *
 * @param {Array} newItems
 * @param {String} modelType
 * @param {String} ownerID
 * @param {String} groupType
 * @param {String} idKey
 * @return updated data
 * @public
 */

export const updateGroup = async (
    newItems,
    modelType,
    ownerID,
    groupType,
    idKey='id') => {

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {
        // create participant model constructor
        const ItemModel = await cserve.create(modelType);

        await client.query('BEGIN');

        // get existing participants in group
        const oldItems = await getGroup(ownerID, modelType, groupType, client);

        // delete existing participants not in updated participant list
        const deleted = await Promise.all(
            oldItems
                .filter(pOld =>
                    newItems.length === 0 || newItems.some(pNew =>
                    parseInt(pOld[idKey]) !== parseInt(pNew[idKey])))
                .map(async (pOld) => {
                    return await remove(new ItemModel(pOld), client);
                }));

        // update existing participants in updated participant list
        const upserted = await Promise.all(
            newItems
                .map(async (pNew) => {
                    return await insert(new ItemModel(pNew), true, client);
                }));

        await client.query('COMMIT');

        // return confirmation data
        return {
            deleted: deleted,
            upserted: upserted,
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Delete metadata item from database.
 *
 * @param {Object} item
 * @param client
 * @return {Function} query function / null if no node
 * @public
 */

export const remove = async(item, client=pool) => {
    let { sql, data } = queries.metadata.remove(item);
    let response = await client.query(sql, data);
    return response.hasOwnProperty('rows') && response.rows.length > 0
        ? response.rows[0]
        : null;
}

/**
 * Delete grouped metadata from database.
 *
 * @param {String} ownerID
 * @param {String} modelType
 * @param {String} groupType
 * @param {String} groupCol
 * @param client
 * @return {Function} query function / null if no node
 * @public
 */

export const removeGroup = async (
    ownerID,
    modelType,
    groupType,
    groupCol='group_type',
    client = pool
) => {
    let { sql, data } = queries.metadata.removeGroup(ownerID, modelType, groupType, groupCol);
    let response = await client.query(sql, data);
    return response.hasOwnProperty('rows') && response.rows.length > 0
        ? response.rows[0]
        : null;
};

/**
 * Get all metadata records for given model type.
 *
 * @public
 * @param {String} model
 * @param client
 * @return {Promise} result
 */

export const getAll = async function(model, client=pool) {
    let { sql, data } = queries.defaults.selectByModel(model);
    let items = await client.query(sql, data);
    return items.rows;
};

/**
 * Get metadata options for given model;
 *
 * @public
 * @return {Promise} result
 */

const findMetadataOptions = async (model, valueCol, labelCols, delimiter, client=pool) => {
    let { sql, data } = queries.metadata.selectMetadataOptionsByModel(
        model, valueCol, labelCols, delimiter);
    let metadata = await client.query(sql, data);
    return metadata.rows;
}

/**
 * Get metadata options.
 *
 * @public
 * @return {Promise} result
 */

export const getMetadataOptions = async function(client=pool) {
    return {
        image_states: await findMetadataOptions(
            'image_states', 'name', ['label'], '', client
        ),
        cameras: await findMetadataOptions(
            'cameras','id', ['model'], '', client
        ),
        lens: await findMetadataOptions(
            'lens', 'id', ['brand'], '', client
        ),
        participants: await findMetadataOptions(
            'participants', 'id', ['last_name', 'given_names'], ', ', client
        ),
        participant_group_types: await findMetadataOptions(
            'participant_group_types', 'name', ['label'], '', client
        ),
        image_types: await findMetadataOptions(
            'image_types', 'name', ['label'], '', client
        ),
        metadata_file_types: await findMetadataOptions(
            'metadata_file_types', 'name', ['label'], '', client
        ),
        surveyors: await findNodeOptions(
            'surveyors',
            ['last_name', 'given_names', 'short_name', 'affiliation'],
            ', ',
            false,
            client
        ),
        survey_seasons: await findNodeOptions(
            'survey_seasons',
            ['year'],
            '',
            true,
            client
        ),
        surveys: await findNodeOptions(
            'surveys',
            ['name'],
            '',
            true,
            client
        )
    }
};

/**
 * Get representative capture image file data.
 * - filters capture files by image state
 *
 * @param files
 * @param owner
 * @return {*}
 */

export const getCaptureImage = (files, owner) => {
    const { historic_images=null, modern_images=null } = files || {};
    const captureImages = historic_images || modern_images || [];
    const { id='', type='' } = owner || {};
    const fileType = type === 'historic_captures' ? 'historic_images' : 'modern_images'
    return captureImages.find(file => file.metadata.image_state === 'master')
    || captureImages.find(file => file.metadata.image_state === 'interim')
    || captureImages.find(file => file.metadata.image_state === 'raw')
    || captureImages.find(file => file.metadata.image_state === 'gridded')
    || captureImages.find(file => file.metadata.image_state === 'misc')
    || {label: 'No Images', file: {file_type: fileType, owner_id: id }};
}

/**
 * Get node options for given model;
 *
 * @public
 * @return {Promise} result
 */

const findNodeOptions = async (model, labelCols, delimiter, hasOwner, client=pool) => {
    let { sql, data } = queries.metadata.selectNodeOptionsByModel(model, labelCols, delimiter, hasOwner);
    let metadata = await client.query(sql, data);
    return metadata.rows;
}


/**
 * Get metadata global settings.
 *
 * @public
 * @return {Promise} result
 */

export const getAllSettings = async function(client=pool) {
    return {
        library_root_dir: await findMetadataOptions(
            'library_root_dir', 'id', ['label'], '', client),
        user_roles: await findMetadataOptions(
            'user_roles', 'id', ['label'], '', client),
        node_types: await findMetadataOptions(
            'node_types', 'id', ['label'], '', client),
        node_relations: await findMetadataOptions(
            'node_relations','id', ['label'], '', client),
        file_types: await findMetadataOptions(
            'file_types', 'id', ['label'], '', client),
        file_relations: await findMetadataOptions(
            'file_relations', 'id', ['label'], '', client),
        image_types: await findMetadataOptions(
            'image_types', 'id', ['label'], '', client),
        metadata_types: await findMetadataOptions(
            'metadata_types', 'id', ['label'], '', client),
        metadata_relations: await findMetadataOptions(
            'metadata_relations','id', ['label'], '', client),
        views: await findMetadataOptions(
            'views', 'id', ['label'], '', client),
        image_states: await findMetadataOptions(
            'image_states', 'name', ['label'], ', ', client),
        participant_group_types: await findMetadataOptions(
            'participant_group_types', 'id', ['label'], '', client)
    }
};

/**
 * Get (any) attached metadata for node.
 *
 * @public
 * @return {Promise} result
 */

export const getAttachedByNode = async function(node, client=pool) {

    const {id=''} = node || {};

    // get participants
    const getParticipantOptions = async (id) => {
        let { sql, data } = queries.metadata.getParticipantOptions(id);
        let participants = await client.query(sql, data);
        // group by participant group type
        participants = groupBy(participants.rows, 'group_type') || {};
        // return only model type names as list
        return Object.keys(participants).length > 0 ? [participants] : [];
    }

    // get attached data and include labels
    const getAttachedData = async (id, model) => {
        const attachedItems = await selectByOwner(id, model, client) || [];
        return Promise.all(attachedItems.map( async (item) => {
            return {
                label: await getNodeLabel({id: item.id, type: model}, client),
                data: item
            }
        }));
    }

    return {
        glass_plate_listings: await getAttachedData(id, 'glass_plate_listings'),
        maps: await getAttachedData(id, 'maps'),
        participant_groups: await getParticipantOptions(id),
        comparisons: await getComparisonsMetadata(node, client) || []
    }
};

/**
 * Get repeats (modern captures) for given station node.
 *
 * @public
 * @param {Object} node
 * @param client
 * @return {Promise} result
 */

export const getModernCapturesByStation = async (node, client=pool) => {

    const {id=''} = node || {};
    const { sql, data } = queries.metadata.getModernCapturesByStationID(id);
    return await client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows : [];
        });
};

/**
 * Get historic captures for given station node.
 *
 * @public
 * @param {Object} node
 * @param client
 * @return {Promise} result
 */

export const getHistoricCapturesByStation = async (node, client=pool) => {
    const {id=''} = node || {};
    const { sql, data } = queries.metadata.getHistoricCapturesByStationID(id);
    return await client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows : [];
        });
};

/**
 * Get number of mastered capture images associated with a capture
 *
 * @public
 * @return {Promise} result
 */

const hasMastered = async (captureID, captureImageType, client=pool) => {
    const { sql, data } = queries.metadata.hasMastered(captureID, captureImageType);
    let response = await client.query(sql, data);
    return response.hasOwnProperty('rows') && response.rows.length > 0
        ? response.rows[0]
        : null;
}

/**
 * Get status information for node.
 *
 * Stations:
 * - Station is in the 'Grouped' state. It contains historic captures that have been
 *   grouped together as a single historic station, but the location of this station
 *   has not been estimated.
 * - Station is in the 'Located' state. It contains grouped historic captures and the
 *   location of the station has been estimated. Historic captures have not been repeated.
 * - Station is in the 'Repeated' state. The station contains repeat captures, but at
 *   least one of these captures need to be mastered with its historic capture counterpart
 * - Station is in the 'Partially Mastered' state. The station contains repeat captures
 *   and at least one of them has been mastered, while others still require mastering.
 * - Station is in the 'Mastered' state. The station has been repeated and all of its
 *   captures have been mastered.
 *
 * @public
 * @param {Object} node
 * @param {Object} metadata
 * @param client
 * @return {Promise} result
 */

export const getStatus = async (node, metadata = {}, client = pool) => {

    const { type = '' } = node || {};

    // initialize image versions
    const statusInfo = {
        stations: async () => {
            const comparisons = await getComparisonsByStation(node, client) || [];
            const historicCaptures = await getHistoricCapturesByStation(node, client) || [];
            const modernCaptures = await getModernCapturesByStation(node, client) || [];
            // tally how many historic capture images are mastered
            let totalRepeats = 0;
            let totalMasters = 0;
            let isMastered = true;
            await Promise.all(
                comparisons.map(async (pair) => {
                    const masterStatus = await hasMastered(
                        pair.historic_captures, 'historic_images', client);
                    // ensure any unmastered historic images => unmastered station
                    isMastered = !!parseInt(masterStatus.mastered) && isMastered;
                    totalMasters += parseInt(masterStatus.mastered);
                    totalRepeats += parseInt(masterStatus.total);
                })
            );
            const { lat = null, lng = null } = metadata || {};
            return {
                comparisons: comparisons,
                historic_captures: historicCaptures.length,
                modern_captures: modernCaptures.length,
                grouped: historicCaptures.length > 0 && !(lat && lng),
                located: historicCaptures.length > 0 && !!(lat && lng),
                repeated: comparisons.length > 0,
                partial: !isMastered && totalMasters > 0,
                mastered: isMastered && totalMasters > 0,
                n_masters: totalMasters,
                n_repeats: totalRepeats,
            };
        },
        historic_captures: async () => {
            const comparisons = await getComparisonsByCapture(node, client) || [];
            const masterStatus = await hasMastered(node.id, 'historic_images', client);
            const files = fserve.hasFiles(node.id, client) || false;
            return {
                comparisons: comparisons,
                mastered: parseInt(masterStatus.mastered) > 0,
                compared: comparisons.length > 0,
                sorted: node.owner_type === 'historic_visits',
                missing: !files,
                n_masters: parseInt(masterStatus.mastered),
                n_repeats: parseInt(masterStatus.total),
            };
        },
        modern_captures: async () => {
            const comparisons = await getComparisonsByCapture(node, client) || [];
            const masterStatus = await hasMastered(node.id, 'modern_images', client);
            const files = fserve.hasFiles(node.id, client) || false;
            return {
                comparisons: comparisons,
                mastered: parseInt(masterStatus.mastered) > 0,
                compared: comparisons.length > 0,
                sorted: node.owner_type === 'locations',
                missing: !files,
                n_masters: parseInt(masterStatus.mastered),
                n_repeats: parseInt(masterStatus.total),
            };
        },
    };

    // route database callback after file upload
    return statusInfo.hasOwnProperty(type) ? statusInfo[type]() : '';
};

/**
 * Get node label.
 * - Generates labels for nodes based on specific required metadata
 * - For captures, the fn_photo_reference value may be blank, in which case the
 *   use of a capture image filename is used.
 *
 * @public
 * @param {Object} node
 * @param {Array} files
 * @param client
 * @return {Promise} result
 */

export const getNodeLabel = async (node, files=[], client=pool) => {

    if (!node) return [];
    let label = '';

    const {type='', id=''} = node || {};

    const queriesByType = {
        projects: queries.metadata.selectLabel(
            id, type, ['name']
        ),
        surveyors: queries.metadata.selectLabel(
            id, type, ['last_name', 'given_names'], '', ', '
        ),
        surveys: queries.metadata.selectLabel(
            id, type, ['name']
        ),
        survey_seasons: queries.metadata.selectLabel(id, type, ['year']
        ),
        stations: queries.metadata.selectLabel(
            id, type, ['name']
        ),
        historic_visits: queries.metadata.selectLabel(
            id, type, ['date'], 'Historic Visit'
        ),
        modern_visits: queries.metadata.selectLabel(
            id, type, ['date'], 'MV'
        ),
        locations: queries.metadata.selectLabel(
            id, type, ['location_identity'], 'Loc'
        ),
        historic_captures: queries.metadata.selectLabel(
            id, type, ['fn_photo_reference'], 'HC'
        ),
        modern_captures: queries.metadata.selectLabel(
            id, type, ['fn_photo_reference'], 'MC'
        ),
        glass_plate_listings: queries.metadata.selectLabel(
            id, type, ['container', 'plates'], '', ', ', 'id'
        ),
        maps: queries.metadata.selectLabel(
            id, type, ['nts_map'], '', ', ', 'id'
        )
    };

    if (queriesByType.hasOwnProperty(type)) {
        let { sql, data } = queriesByType[type];

        // get model label value
        label = await client.query(sql, data)
            .then(res => {
                return res.hasOwnProperty('rows')
                && res.rows.length > 0 ? res.rows[0].label.trim() : '';
            });

        // Handle problematic Surveyor Labels
        if (type === 'surveyors' && label === '') {
            // get model label value
            let { sql, data } = queries.metadata.selectLabel(
                id, type, ['affiliation'], '', ', '
            );
            label = await client.query(sql, data)
                .then(res => {
                    return res.hasOwnProperty('rows')
                    && res.rows.length > 0 ? res.rows[0].label.trim() : '';
                });
        }

        // For captures, check if Photo Reference label is missing. If so, use
        // an image file name to label the node.
        if (type === 'historic_captures' && label === 'HC') {
            const captureImages = await fserve.selectByOwner(id, client);
            const { historic_images = [] } = captureImages || {};
            label = historic_images.length > 0 ? historic_images[0].label : label;
        }
        if (type === 'modern_captures' && label === 'MC') {
            const captureImages = await fserve.selectByOwner(id, client);
            const {modern_images = []} = captureImages || {};
            label = modern_images.length > 0 ? modern_images[0].label : label;
        }
    }
    return label;
};

