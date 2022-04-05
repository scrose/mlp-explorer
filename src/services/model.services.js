/*!
 * MLP.API.Services.Model
 * File: model.services.js
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
import * as nqueries from '../queries/nodes.queries.js';
import * as cserve from '../services/construct.services.js';
import {moveFiles, removeAll} from "./files.services.js";
import * as fserve from "./files.services.js";
import {deleteComparisons} from "./comparisons.services.js";

/**
 * Export database model services constructor
 *
 * @public
 * @param {Object} model
 * @return {Promise} result
 */

export default function ModelServices(model) {

    this.model = model;
    this.queries = {};

    // initialize query strings for specified model
    try {

        // initialize default model queries
        Object.keys(queries.defaults)
            .map(key => {
                this.queries[key] = queries.defaults[key](model)
            })

        // override defaults with any model-specific queries
        Object.keys(queries)
            .filter(key => key === model.name)
            .map(qKey => {
                Object.keys(queries[qKey])
                    .map(key => this.queries[key] = queries[qKey][key](model) )
            })

    } catch (err) {
        throw err;
    }

    /**
     * Initialize table. (no transaction)
     *
     * @public
     * @param {Object} data
     * @return {Promise} result
     */

    this.init = async function() {
        let { sql, data } = this.queries.init();
        await pool.query(sql, data);
    };

    /**
     * Find record by ID.
     *
     * @public
     * @param {String} id
     * @return {Promise} result
     */

    this.select = async function(id) {
        this.model.id = id;
        const stmts = {
            node: null,
            model: this.queries.select
        };

        // execute transaction
        return await this.transact(this.model, stmts);
    };

    /**
     * Insert record into table. (Uses transaction).
     *
     * @public
     * @param {Array} data
     * @return {Promise} result
     */

    this.insert = async function(item) {

        let stmts = {
            node: nqueries.insert,
            model: this.queries.insert
        };

        // execute transaction
        return await this.transact(item, stmts);
    };

    /**
     * Update data in existing record.
     *
     * @public
     * @param {Object} item
     * @return {Promise} result
     */

    this.update = async function(item) {

        let stmts = {
            node: nqueries.update,
            model: this.queries.update
        };

        // execute transaction
        return await this.transact(item, stmts);
    };

    /**
     * Move model item (and attached files) to new owner.
     *
     * @public
     * @param {String} id
     * @return {Promise} result
     */

    this.move = async function(item, owner) {
        // update item owner
        item.owner = owner.id || 0;
        // get attached files
        const files = await fserve.selectByOwner(item.id) || [];
        // generate node model from item reference
        const node = await cserve.createNode(item);

        let stmts = {
            node: nqueries.update,
            model: this.queries.update,
            files: async(client) => {
                await moveFiles(files, node, client);
            }
        };

        // execute transaction
        return await this.transact(item, stmts);
    };


    /**
     * Remove record. Note: need to delete any dependent files/metadata
     * before removing node.
     *
     * @public
     * @param item
     * @param files
     * @return {Promise} result
     */

    this.remove = async function(item=[]) {
        // get attached files
        const files = await fserve.selectByOwner(item.id) || [];

        let stmts = {
            node: nqueries.remove,
            model: this.queries.remove,
            files: async (client)=>{
                await removeAll(files, client);
            }
        };

        // execute transaction
        return await this.transact(item, stmts);
    };


    /**
     * Perform transaction query.
     *
     * @param {Object} item
     * @param {Object} statements
     * @return {Promise} db response
     */

    this.transact = async function(item, stmts) {

        const client = await pool.connect();

        try {

            // transaction result
            let res;

            await client.query('BEGIN');

            // [1] process file queries (if provided)
            if (stmts.files) {
                res = await stmts.files(client);
            }

            // [2] process node query (if provided)
            if (stmts.node) {

                // create node model from item reference
                let node = await cserve.createNode(item);

                // generate prepared statements collated with data
                const {sql, data} = stmts.node(node);
                res = await client.query(sql, data);

                // update item with returned data for further processing
                item.id = res.rows[0].id;
            }

            // [3] process model data query (if provided)
            if (stmts.model) {
                const { sql, data } = stmts.model(item);
                res = await client.query(sql, data);
            }

            await client.query('COMMIT');

            // return confirmation data
            return res.hasOwnProperty('rows') && res.rows.length > 0
                ? res.rows[0]
                : null;

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            await client.release(true);
        }
    };
}

