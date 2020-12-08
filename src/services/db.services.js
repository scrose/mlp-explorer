/*!
 * MLP.API.DB.Services
 * File: users.db.services.js
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
 * Export database services constructor
 *
 * @public
 * @return {Promise} result
 */

export default function Services(model) {
    this.model = model;
    this.queries = {};

    // load query strings for specified model
    try {
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
        console.log(sql);
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
        // input item data into query functions
        let statements = this.queries.insert.map(q => q(item));
        console.log(statements)
        return this.transact(statements);
    };

    /**
     * Update data in existing record.
     *
     * @public
     * @param {Array} data
     * @return {Promise} result
     */

    this.update = async function(item) {
        let { sql, data } = this.queries.update(item);
        console.log(sql, data);
        return pool.query(sql, data);
    };

    /**
     * Remove record.
     *
     * @public
     * @param {String} id
     * @return {Promise} result
     */

    this.remove = async function(id) {
        let { sql, data } = this.queries.remove(id);
        return pool.query(sql, data);
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
     * Postgres transaction.
     *
     * @param {Array} statements
     * @return {Promise} db response
     */

    this.transact = async function(statements) {
        // note: we don't try/catch this because if connecting throws
        // an exception
        // we don't need to dispose of the client (it will be undefined)
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            let res = await Promise.all(statements.map(async (s) => {
                return await client.query(s.sql, s.data);
            }));
            await client.query('COMMIT');
            return res;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    };
}

