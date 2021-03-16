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
import { mapToObj } from '../lib/data.utils.js';
import * as fserve from './files.services.js';
import * as mdserve from './metadata.services.js';
import { sanitize } from '../lib/data.utils.js';

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
 * Get model data by node reference. Returns single node object.
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

    // append model data, files and dependents (child nodes)
    return {
        node: node,
        metadata: await selectByNode(node, client),
        files: await fserve.selectByOwner(id, client) || [],
        dependents: await selectByOwner(id, client) || [],
        hasDependents: await hasDependents(id, client) || false
    }
};

/**
 * Get all nodes for given model. Includes dependents data.
 *
 * @public
 * @param {String} model
 * @return {Promise} result
 */

export const getAll = async function(model) {

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
                return {
                    node: node,
                    metadata: await selectByNode(node, client),
                    hasDependents: hasDependents(node.id, client) || false
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
            return {
                node: node,
                metadata: await selectByNode(node, client),
                files: await fserve.selectByOwner(node.id, client),
                hasDependents: await hasDependents(node.id, client),
                status: await getStatus(node, client)
            }
    }));

    // return nodes
    return nodes;

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

        let { owner_id = null } = node || {};
        let id = node.id;
        // const leafNode = {id: node.id, type: node.type, owner_id: owner_id};
        let nodePath = new Map();
        let end = 9; // limit traversal of node tree to 9
        let n = 1; // branch counter

        // get current item data (if item exists)
        let leafNode = {};
        leafNode.node = node;
        leafNode.metadata = await selectByNode(node, client) || {};

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
                nodePath.set(n, newNode);

                // reset node iteration
                id = owner_id;
                owner_id = parentNode.owner_id;
            }
            n++;
        } while (id && n < end)

        // return node path as JS object
        return mapToObj(nodePath);

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};


/**
 * Get status information for node.
 *
 * @public
 * @param {Object} node
 * @param client
 * @return {Promise} result
 */

export const getStatus = async (node, client=pool) => {

    const {type=''} = node || {};

    // initialize image versions
    const statusInfo = {
        historic_captures: async () => {
            return{
                comparisons: await mdserve.getComparisons(node, client)
            };
        },
        modern_captures: async () => {
            return{
                comparisons: await mdserve.getComparisons(node, client)
            };
        }
    }

    // route database callback after file upload
    return statusInfo.hasOwnProperty(type) ? statusInfo[type]() : '';
};
