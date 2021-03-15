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

/**
 * Get node by ID. Returns single node object.
 *
 * @public
 * @param {number} id
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
 * @return {Promise} result
 */

export const get = async (id) => {

    if (!id) return null;

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();
    let item = {};

    try {

        // start transaction
        await client.query('BEGIN');

        // get requested node
        item.node = await select(id);

        // check that node exists
        if (!item.node) return null;

        // append model data, files and dependents (child nodes)
        item.metadata = await selectByNode(item.node);
        item.files = await fserve.selectByOwner(id) || [];
        item.dependents = await selectByOwner(id) || [];
        item.hasDependents = await hasDependents(id) || false;

        // end transaction
        await client.query('COMMIT');

        // return nodes
        return item;

    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
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
                hasDependents: await hasDependents(node.id, client)
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
 * Get full data of dependent node data for given model item.
 * This call retrieves two levels of dependent nodes as well as
 * dependent file nodes.
 *
 * @public
 * @param {Object} item
 * @param {Integer} depth
 * @return {Promise} result
 */

export const getModelDependents = async (item, depth=2) => {

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {
        // start transaction
        await client.query('BEGIN');

        // get first-level node data for each dependent node
        let dependents = await selectByOwner(item.id);

        // append first-level dependents
        if (depth > 0)
            dependents.dependents = await Promise.all(
                dependents.map(async (dependentL1) => {
                    dependentL1.dependents = await selectByOwner(dependentL1.id, client);

                // append second-level dependents
                if (depth > 1) {
                    dependentL1.dependents = await Promise.all(
                        dependentL1.dependents.map(async (dependentL2) => {
                            dependentL2.dependents = await selectByOwner(dependentL2.id, client);
                            return dependentL2;
                        }),
                    );
                }

                return dependentL1;
            }));

        // end transaction
        await client.query('COMMIT');

        // return nodes
        return dependents;

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

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
