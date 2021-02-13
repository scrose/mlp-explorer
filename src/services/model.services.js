/*!
 * MLP.API.Services.Database
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
import { createNode } from './construct.services.js';
import * as ns from '../queries/nodes.queries.js';

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
     * Find all records in table. (no transaction)
     *
     * @public
     * @return {Promise} result
     */

    this.getAll = async function() {
        let { sql, data } = this.queries.getAll();
        return pool.query(sql, data)
            .then(res => {
                return res.rows
            });
    };

    /**
     * Find record by ID.
     *
     * @public
     * @param {String} id
     * @return {Promise} result
     */

    this.select = async function(id) {
        this.model.setId(id);
        const stmts = {
            node: null,
            model: this.queries.select,
            attached: []
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
            node: ns.insert,
            model: this.queries.insert,
            attached: []
        };

        // execute transaction
        return await this.transact(item, stmts);
    };

    /**
     * Update data in existing record.
     *
     * @public
     * @param {Array} data
     * @return {Promise} result
     */

    this.update = async function(item) {
        let stmts = {
            node: ns.update,
            model: this.queries.update,
            attached: []
        };

        // execute transaction
        return await this.transact(item, stmts);
    };

    /**
     * Remove record.
     *
     * @public
     * @param {String} id
     * @return {Promise} result
     */

    this.remove = async function(item) {
        let stmts = {
            node: ns.remove,
            model: this.queries.remove,
            attached: []
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

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {
            // transaction result
            let res;

            await client.query('BEGIN');

            // process node query (if provided)
            if (stmts.node) {

                // create node model from item reference
                let node = await createNode(item);

                // generate prepared statements collated with data
                const {sql, data} = stmts.node(node);
                res = await client.query(sql, data);

                // update item with returned data for further processing
                item.setId(res.rows[0].id);
            }

            // process model data query (if provided)
            if (stmts.model) {
                const { sql, data } = stmts.model(item);
                res = await client.query(sql, data);

                // process supplemental statements (e.g. foreign key references)
                res.attached = await Promise.all(stmts.attached.map(async (stmt) => {
                    const val = item.getValue(item.name);
                    const {sql, data} = stmt(item, val);
                    return await client.query(sql, data);
                }));
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
            client.release();
        }
    };
}

