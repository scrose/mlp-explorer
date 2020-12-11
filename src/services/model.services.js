/*!
 * MLP.API.Services.Database
 * File: model.services.js
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
 * @return {Promise} result
 */

export default function Services(model) {
    this.model = model;
    this.queries = {};

    // load query strings for specified model
    try {
        // load default queries
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
        let { sql, data } = this.queries.select(id);
        return pool.query(sql, data);
    };

    /**
     * Insert record into table. (Uses transaction).
     *
     * @public
     * @param {Array} data
     * @return {Promise} result
     */

    this.insert = async function(item) {
        let statement = this.queries.insert(item);
        return await this.transact(statement, item, this.queries.attach);
    };

    /**
     * Update data in existing record.
     *
     * @public
     * @param {Array} data
     * @return {Promise} result
     */

    this.update = async function(item) {
        let statement = this.queries.update(item);
        return await this.transact(statement, item, this.queries.attach);
    };

    /**
     * Remove record.
     *
     * @public
     * @param {String} id
     * @return {Promise} result
     */

    this.remove = async function(item) {
        let statement = this.queries.remove(item);
        return await this.transact(statement, item, this.queries.detach);
    };

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
     * Perform transaction.
     *
     * @param {Object} statement
     * @param {Object} item
     * @param {Object} attachment
     * @return {Promise} db response
     */

    this.transact = async function(statement, item, attachment=null) {

        // NOTE: client undefined if connection fails.
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // insert record and record returned ID value
            let res = await client.query(statement.sql, statement.data);
            item.setValue('id', res.rows[0].id);

            // attach/detach node to/from owner (if given)
            if (attachment) {
                let attachStatement = attachment(item);
                let n = await client.query(attachStatement.sql, attachStatement.data);
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

