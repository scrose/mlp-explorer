/*!
 * MLP.API.Services.DB.Model
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
import { createNode, createFile } from './model.services.js';

/**
 * Export database model services constructor
 *
 * @public
 * @param {Object} model
 * @return {Promise} result
 */

export default function DBServices(model) {

    this.model = model;
    this.queries = {};

    // initialize query strings for specified model
    try {
        // prepare default queries
        Object.keys(queries.defaults)
            .map(key => {
                this.queries[key] = queries.defaults[key](model)
            });

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
        return pool.query(sql, data);
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
            file: null,
            model: this.queries.select,
            attached: []
        };

        // // create attached statements for references
        // const attachedStmts = this.model.attached
        //     .map(a => {
        //         return {
        //             query: this.queries.append
        //         };
        //     });
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
            node: this.queries.insertNode,
            file: this.queries.insertFile,
            model: this.queries.insert,
            attached: []
        };
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
            node: this.queries.updateNode,
            file: this.queries.updateFile,
            model: this.queries.update,
            attached: []
        };
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
            node: this.queries.removeNode,
            file: this.queries.removeFile,
            model: this.queries.remove,
            attached: []
        };
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

        console.log(stmts)

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

            // process file query (if provided)
            if (stmts.file) {
                // create file model from item reference
                let file = await createFile(item);
                // generate prepared statements collated with data
                const {sql, data} = stmts.file(file);
                res = await client.query(sql, data);

                // update item with returned data for further processing
                item.setId(res.rows[0].id);
            }

            // process primary model query (if exists)
            // process node query (if provided)
            if (stmts.model) {
                const { sql, data } = stmts.model(item);
                res = await client.query(sql, data)

                // process supplemental statements (e.g. foreign key references)
                res.attached = await Promise.all(stmts.attached.map(async (stmt) => {
                    const val = item.getValue(item.name);
                    const {sql, data} = stmt(item, val);
                    return await client.query(sql, data);
                }));
            }

            await client.query('COMMIT');

            return res;

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    };
}

