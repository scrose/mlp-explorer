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
 * @param {Model} model
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
     * Initialize table.
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
     * Find all records in table.
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
        const stmts = {
            model: this.queries.select(id)
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
            node: this.queries.insertNode(item),
            model: this.queries.insert(item)
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
            node: this.queries.updateNode(item),
            model: this.queries.update(item)
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
            node: this.queries.removeNode(item),
            model: this.queries.remove(item)
        };
        return await this.transact(item, stmts);
    };

    /**
     * Perform transaction.
     *
     * @param {Object} statement
     * @param {Object} item
     * @param {Object} relation
     * @param {Array} attachments
     * @return {Promise} db response
     */

    this.transact = async function(item, stmts) {

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // insert record and record returned ID value
            let res = await client.query(stmt.sql, stmt.data);

            // update item with returned data for further processing
            item.setData(res.rows[0]);

            // process subordinate statements (e.g. foreign key references)
            await Promise.all(attachedStmts.map(async (aStmt) => {
                const val = item.getValue(a.fk_col);
                const prepStmt = aStmt(item, val);
                res.attached = await client.query(prepStmt.sql, prepStmt.data);
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

