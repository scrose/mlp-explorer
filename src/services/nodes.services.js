/*!
 * MLP.API.Services.Nodes
 * File: db.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import pool from './pgdb.js';
import queries from '../queries/index.queries.js';
import { mapToObj } from '../lib/data.utils.js';

/**
 * Get node by ID. Returns single node object.
 *
 * @public
 * @param {integer} id
 * @return {Promise} result
 */

export const getNode = async (id) => {
    let { sql, data } = queries.nodes.getNode(id);
    let node = await pool.query(sql, data);
    return node.rows[0];
};

/**
 * Get all nodes for given model. Includes dependents data.
 *
 * @public
 * @param {String} model
 * @return {Promise} result
 */

export const getNodes = async function(model) {

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {

        // start transaction
        await client.query('BEGIN');

        // get all nodes for model
        let { sql, data } = queries.nodes.getNodes(model);
        const { rows=[] } = await pool.query(sql, data) || {}

        // get full data for dependent nodes
        let nodes = await Promise.all(rows.map(async (node) => {
            node.data = await selectByNode(node);
            node.dependents = await getDependentNodes({id: node.id});
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
 * Get node by ID. Returns single node object.
 *
 * @public
 * @param {integer} node
 * @return {Promise} result
 */

export const selectByNode = async (node) => {
    let { sql, data } = queries.defaults.selectByNode(node);
    return await pool.query(sql, data)
        .then(res => {
            return res.hasOwnProperty('rows')
            && res.rows.length > 0 ? res.rows[0] : null;
        });
};

/**
 * Get referenced child node(s) by parent.
 *
 * @public
 * @param {Object} item
 * @return {Promise} result
 */

export const getDependentNodes = async (item) => {

    let { sql, data } = queries.defaults.getChildNodes(item.id);
    let dependents = await pool.query(sql, data)
        .then(res => {
            return res.rows
        });

    // get child nodes for retrieved child nodes
    dependents = await Promise.all(dependents.map(async (node) => {

        let { sql, data } = queries.defaults.getChildNodes(node.id);

        // attach subdependents to each dependent node
        node.dependents = await pool.query(sql, data)
            .then(res => {
                return res.rows
            });
        return node;
    }));

    // return nodes
    return dependents;

};

/**
 * Get full data of dependent nodes data for given node.
 *
 * @public
 * @param {Object} item
 * @return {Promise} result
 */

export const getDependents = async (item) => {

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {
        // start transaction
        await client.query('BEGIN');

        let depNodes = await getDependentNodes(item);

        // get full data for dependent nodes
        let dependents = await Promise.all(depNodes.map(async (node) => {
            node.data = await selectByNode(node);
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
 * Find node path for given item.
 *
 * @public
 * @params {Object} item
 * @return {Promise} result
 */
export const getNodePath = async (item) => {

    // NOTE: client undefined if connection fails.
    const client = await pool.connect();

    try {
        // start transaction
        await client.query('BEGIN');

        // initialization
        const { owner = { } } = item || {};
        const { value=null } = owner || {};
        let id = item.id;
        let ownerId = value;
        let node = {ownerId: null};
        let nodePath = new Map();
        let end = 9; // limit traversal of node tree to 9
        let n = 1;

        // set leaf node of tree
        nodePath.set(0, {
            owner_id: item.id,
            type: item.table,
            data: item.getData()
        });

        // follow owners up the node hierarchy
        do {
            // get owner node
            if (ownerId) {
                node = await getNode(ownerId);
                // append node data
                node.data = ownerId ? await selectByNode(node) : {};
                // set node path item
                nodePath.set(n, node);
            }
            // reset node iteration
            id = ownerId;
            ownerId = node.owner_id;
            n++;
        } while (id && n < end)

        // end transaction
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
