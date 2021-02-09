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
import * as fs from './files.services.js';

/**
 * Get node by ID. Returns single node object.
 *
 * @public
 * @param {integer} id
 * @return {Promise} result
 */

export const select = async (id) => {
    if (!id) return null;
    let { sql, data } = queries.nodes.select(id);
    let node = await pool.query(sql, data);
    return node.rows[0];
};

/**
 * Get model data by node reference. Returns single node object.
 *
 * @public
 * @param {Object} node
 * @return {Promise} result
 */

export const selectByNode = async (node) => {
    let { sql, data } = queries.defaults.selectByNode(node);
    return pool.query(sql, data)
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

    try {

        // start transaction
        await client.query('BEGIN');

        // get requested node
        let node = await select(id);

        // check that node exists
        if (!node) return null;

        // append model data, files and dependents (child nodes)
        node.data = await selectByNode(node);
        node.files = await fs.selectByOwner(node.id);
        node.dependents = await selectByOwner(node.id) || [];
        node.hasDependents = await hasDependents(node.id) || false;

        // end transaction
        await client.query('COMMIT');

        // return nodes
        return node;

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
        const { rows=[] } = await pool.query(sql, data) || {}

        // append model data and dependents (child nodes)
        let nodes = await Promise.all(rows.map(async (node) => {
            node.data = await selectByNode(node);
            node.files = await fs.selectByOwner(node.id) || [];
            node.hasDependents = hasDependents(node.id) || false;
            return node;
        }));

        // end transaction
        await client.query('COMMIT');

        // return nodes
        return nodes;

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};


/**
 * Get referenced child node(s) by parent ID value.
 * Use within a client transaction.
 *
 * @public
 * @param {integer} id
 * @return {Promise} result
 */

export const selectByOwner = async (id) => {

    // get dependent nodes for owner
    let { sql, data } = queries.nodes.selectByOwner(id);
    let nodes = await pool.query(sql, data)
        .then(res => {
            return res.rows
        });

    // append full data for each dependent node
    nodes = await Promise.all(nodes.map(async (node) => {
        node.data = await selectByNode(node);
        node.files = await fs.selectByOwner(node.id) || [];
        node.hasDependents = await hasDependents(node.id) || false;
        return node;
    }));

    // return nodes
    return nodes;

};

/**
 * Check if node has dependent nodes.
 *
 * @public
 * @param {integer} id
 * @return {boolean} result
 */

export const hasDependents = async (id) => {

    // get dependent nodes for owner
    let { sql, data } = queries.nodes.selectByOwner(id);
    let nodes = await pool.query(sql, data)
        .then(res => {
            return res.rows
        });
    return nodes.length > 0;
};

/**
 * Get full data of dependent node data for given model item.
 * This call retrieves two levels of dependent nodes as well as
 * dependent file nodes.
 *
 * @public
 * @param {Object} item
 * @return {Promise} result
 */

export const getModelDependents = async (item) => {

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {
        // start transaction
        await client.query('BEGIN');

        // get first-level full data for each dependent node
        let dependents = await selectByOwner(item.id);

        // append second-level full data for each sub-dependent node
        dependents = await Promise.all(dependents.map(async (node) => {
            node.data = await selectByNode(node);
            node.files = await fs.selectByOwner(node.id) || [];
            node.dependents = await selectByOwner(node.id);
            return node;
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
 * @params {Object} node
 * @return {Promise} result
 */
export const getPath = async (node) => {

    if (!node) return null;

    try {
        let { owner_id = null } = node || {};
        let id = node.id;
        // const leafNode = {id: node.id, type: node.type, owner_id: owner_id};
        let nodePath = new Map();
        let end = 9; // limit traversal of node tree to 9
        let n = 1; // branch counter

        // get current item data (if item exists)
        node.data = await selectByNode(node) || {};

        // set leaf node of tree
        nodePath.set(0, node);

        // follow owners up the node tree hierarchy
        do {
            // get owner node
            if (owner_id) {

                const parentNode = await select(owner_id) || {};

                // append node data
                parentNode.data = await selectByNode(parentNode) || {};
                // set node path item
                nodePath.set(n, parentNode);

                // reset node iteration
                id = owner_id;
                owner_id = parentNode.owner_id;
            }
            n++;
        } while (id && n < end)

        // return node path as JS object
        return mapToObj(nodePath);

    } catch (err) {
        throw err;
    }
};
