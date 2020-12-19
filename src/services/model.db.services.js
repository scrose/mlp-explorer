/*!
 * MLP.API.Services.DB.Model
 * File: model.db.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import pool from './pgdb.js';
import queries from './queries/index.queries.js';

/**
 * Export database model services constructor
 *
 * @public
 * @param {Object} model
 * @return {Promise} result
 */

export default function Services(model) {
    this.model = model;
    this.queries = {};

    // load query strings for specified model
    try {
        // prepare default queries
        Object.entries(queries.defaults)
            .forEach(([key, query]) => {
                this.queries[key] = query(model);
            });

        // override with model-specific queries
        if (queries.hasOwnProperty(model.name))
            Object.entries(queries[model.name])
                .forEach(([key, query]) => {
                    this.queries[key] = query(model);
                });
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
            model: this.queries.select,
            attached: []
        };
        // console.log(this.model.attached)

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

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // process node query (if provided)
            if (stmts.node) {
                const {sql, data} = stmts.node(item.node);
                const res = await client.query(sql, data);
                // update item with returned data for further processing
                item.setId(res.rows[0].id);
            }

            // process primary model query
            const {sql, data} = stmts.model(item);
            console.log('!!!QUERY: ', sql, data)
            let res = await client.query(sql, data)

            // process supplemental statements (e.g. foreign key references)
            await Promise.all(stmts.attached.map(async (stmt) => {
                const val = item.getValue(item.fk_col);
                const {sql, data} = stmt(item, val);
                res.attached = await client.query(sql, data);
            }));

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

