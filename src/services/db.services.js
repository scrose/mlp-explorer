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
 * Export services constructor
 *
 * @public
 * @return {Promise} result
 */

export default function Services(model) {
    this.model = model;
    this.queries = {};

    // Check for defined queries for model
    if (typeof queries[model] !== 'undefined') {
        this.queries = queries[model];
    }

    // include default queries if not defined
    Object.entries(queries.defaults)
        .filter(([key, query]) => {
            console.log(key, query);
        });

    /**
     * Insert record into table.
     *
     * @public
     * @param {Array} data
     * @return {Promise} result
     */

    this.insert = async function(item) {
        let data = item.getData();
        let { query, dataArr } = queries.insert(this.model, data);
        return pool.query(query, dataArr);
    };

    /**
     * Update data in existing record.
     *
     * @public
     * @param {Array} data
     * @return {Promise} result
     */

    this.update = async function(data) {
        return pool.query(
            queries.update(this.model.name), data,
        );
    };

    /**
     * Find all records.
     *
     * @public
     * @return {Promise} result
     */

    this.getAll = async function() {

        let query = typeof queries.getAll === 'function'
            ? queries.getAll(model.name)
            : queries.getAll;

        return pool.query(
            query, [],
        );
    };

    /**
     * Find record by ID.
     *
     * @public
     * @param {String} id
     * @return {Promise} result
     */

    this.select = async function(id) {
        return pool.query(
            queries.select(this.model.name), [id],
        );
    };

    /**
     * Remove record.
     *
     * @public
     * @param {String} id
     * @return {Promise} result
     */

    this.remove = async function(id) {
        this.verify('remove');
        return pool.query(queries[this.table].remove, [id]);
    };

    /**
     * Initialize table.
     *
     * @public
     * @param {Object} data
     * @return {Promise} result
     */

    this.init = async function(data) {

        // create pgsql PL function
        await pool.query(queries[this.table].init.create, []);

        // execute function
        return pool.query(queries[this.table].init.exec, data);
    };

    /**
     * Verify table/query exists for model. Throws error if not found.
     *
     * @public
     */

    this.verify = function(key) {
        if (typeof queries[this.table][key] === 'undefined')
            throw new Error('noquery');
    };

    /**
     * Prepare transaction.
     */

    this.transact = function(data) {
        let statements = [];

        return `BEGIN; ${statements} COMMIT;`;
    };

}

