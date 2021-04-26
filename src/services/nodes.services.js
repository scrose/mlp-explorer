/*!
 * MLP.API.Services.Nodes
 * File: nodes.services.js
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
import { mapToObj, sanitize } from '../lib/data.utils.js';
import * as mserve from './metadata.services.js';
import * as fserve from './files.services.js';
import { getCaptureImage, getStatus } from './metadata.services.js';

/**
 * Get node by ID. Returns single node object.
 *
 * @public
 * @param {integer} id
 * @param client
 * @return {Promise} result
 */

export const select = async (id, client=pool) => {
    if (!id) return null;
    let { sql, data } = queries.nodes.select(id);
    let node = await client.query(sql, data);
    return node.hasOwnProperty('rows') && node.rows.length > 0
        ? node.rows[0]
        : null;
};

/**
 * Get model data by node reference. Returns single metadata object.
 *
 * @public
 * @param {Object} node
 * @param client
 * @return {Promise} result
 */

export const selectByNode = async (node, client=pool) => {
    let { sql, data } = queries.defaults.selectByNode(node);
    return client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows[0] : null;
        });
};

/**
 * Get node + data + dependents by ID. Returns single node object.
 *
 * @public
 * @param {integer} id
 * @param client
 * @return {Promise} result
 */

export const get = async (id, client=pool) => {

    if (!id) return null;

    // get requested node
    const node = await select(id, client);

    // check that node exists
    if (!node) return null;

    // get node model metadata
    const metadata = await selectByNode(node, client);
    const files = await fserve.selectByOwner(id, client) || [];

    // append model data, files and dependents (child nodes)
    return {
        type: node.type,
        node: node,
        metadata: metadata,
        label: await mserve.getNodeLabel(node, files, client),
        files: files,
        refImage: getCaptureImage(files),
        dependents: await selectByOwner(id, client) || [],
        hasDependents: await hasDependents(id, client) || false,
        status: await getStatus(node, metadata, client),
    }
};

/**
 * Get all nodes for top-level node tree. Includes dependents data.
 *
 * @public
 * @param {String} model
 * @return {Promise} result
 */

export const getTree = async function(model) {

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {

        // start transaction
        await client.query('BEGIN');

        // get all nodes for model
        let { sql, data } = queries.nodes.selectByModel(model);
        let nodes = await client.query(sql, data)
            .then(res => {
                return res.rows
            });

        // append model data and dependents (child nodes)
        let items = await Promise.all(
            nodes.map(async (node) => {
                const metadata = await selectByNode(node, client);
                return {
                    node: node,
                    label: await mserve.getNodeLabel(node),
                    type: node.type,
                    metadata: metadata,
                    hasDependents: await hasDependents(node.id, client) || false,
                    status: await getStatus(node, metadata, client)
                }
            })
        );

        // end transaction
        await client.query('COMMIT');

        // return nodes
        return items;

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release(true);
    }
};

/**
 * Get filtered station location data and additional context metadata.
 *
 * @public
 * @param {Object} filter
 * @return {Promise} result
 */

export const getMap = async function(filter=null) {

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {

        // start transaction
        await client.query('BEGIN');

        // get all nodes for station model
        let { sql, data } = queries.metadata.getMapLocations('stations');
        let stations = await client.query(sql, data)
            .then(res => {
                return res.rows || [];
            });

        // end transaction
        await client.query('COMMIT');

        // return nodes
        return stations;

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release(true);
    }
};

/**
 * Get referenced child node(s) by parent ID value.
 * Use within a client transaction.
 *
 * @public
 * @param {integer} id
 * @param client
 * @return {Promise} result
 */

export const selectByOwner = async (id, client=pool) => {

    id = sanitize(id, 'integer');

    // get dependent nodes for owner
    let { sql, data } = queries.nodes.selectByOwner(id);
    let nodes = await client.query(sql, data)
        .then(res => {
            return res.rows
        });

    // append full data for each dependent node
    nodes = await Promise.all(
        nodes.map(async (node) => {
            const metadata = await selectByNode(node, client);
            const files = await fserve.selectByOwner(node.id, client);
            return {
                node: node,
                label: await mserve.getNodeLabel(node),
                type: node.type,
                metadata: metadata,
                files: files,
                refImage: getCaptureImage(files),
                hasDependents: await hasDependents(node.id, client),
                status: await getStatus(node, metadata, client)
            }
    }));

    // return nodes
    return nodes;

};


/**
 * Get list of requested nodes by IDs.
 *
 * @public
 * @params {Object} inputNode
 * @return {Promise} result
 */

export const filterNodesByID = async (nodeIDs, offset, limit) => {

    if (!nodeIDs) return null;

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {
        // start transaction
        await client.query('BEGIN');

        // get filtered nodes
        let { sql, data } = queries.nodes.filterByIDArray(nodeIDs, offset, limit);
        let nodes = await client.query(sql, data)
            .then(res => {
                return res.rows
            });

        const count = nodes.length > 0 ? nodes[0].total : 0;

        // append model data and dependents (child nodes)
        let items = await Promise.all(
            nodes.map(async (node) => {
                return await get(node.id);
            })
        );

        // end transaction
        await client.query('COMMIT');

        return {
            query: nodeIDs,
            limit: limit,
            offset: offset,
            results: items,
            count: count
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Check if node has dependent nodes.
 *
 * @public
 * @param {integer} id
 * @param client
 * @return {boolean} result
 */

export const hasDependents = async (id, client=pool) => {
    let { sql, data } = queries.nodes.hasDependent(id);
    return client.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows') && res.rows.length > 0
                ? res.rows[0].exists
                : false;
    });
};

/**
 * Find node path in tree for given node.
 *
 * @public
 * @params {Object} inputNode
 * @return {Promise} result
 */

export const getPath = async (inputNode) => {

    if (!inputNode) return null;

    // make shallow copy of node
    const node = Object.assign({}, inputNode);

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {
        // start transaction
        await client.query('BEGIN');

        // initialize node path map
        let nodePath = new Map();
        // check if leaf is a file
        const isFile = node.hasOwnProperty('file_type');
        // destructure node data
        let { owner_id = null, id=null } = node || {};
        // limit traversal of node tree to 9 iterations
        let end = 9;
        // node tree branch counter
        let n = 1;

        // get current item data (if item exists)
        let leafNode = isFile
            ? {
                file: node,
                metadata: await fserve.selectByFile(node, client) || {},
                label: await mserve.getFileLabel(node)
            }
            : {
                node: node,
                metadata: await selectByNode(node, client) || {},
                label: await mserve.getNodeLabel(node)
            }

        // set leaf node of tree
        nodePath.set(0, leafNode);

        // follow owners up the node tree hierarchy
        do {
            // get owner node
            if (owner_id) {

                const parentNode = await select(owner_id, client) || {};

                // append new node to path
                let newNode = {};
                newNode.node = parentNode;
                newNode.metadata = await selectByNode(parentNode, client) || {};
                newNode.label = await mserve.getNodeLabel(parentNode);
                nodePath.set(n, newNode);

                // reset node iteration
                id = owner_id;
                owner_id = parentNode.owner_id;
            }
            n++;
        } while (id && n < end);

        await client.query('COMMIT');

        // return node path as JS object
        return mapToObj(nodePath);

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
