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

    // load model queries
    try {
        Object.entries(queries[model.name])
            .forEach(([key, query]) => {
                console.log(query)
                this.queries[key] = query(model);
            });
    }
    catch (err) {
        throw err;
    }

    /**
     * Insert record into table.
     *
     * @public
     * @param {Array} data
     * @return {Promise} result
     */

    this.insert = async function(item) {
        this.verify('insert')
        return pool.query(this.queries.insert, item.getData());
    };

    /**
     * Update data in existing record.
     *
     * @public
     * @param {Array} data
     * @return {Promise} result
     */

    this.update = async function(item) {
        this.verify('update')
        return pool.query(this.queries.update, item.getData());
    };

    /**
     * Find all records in table.
     *
     * @public
     * @return {Promise} result
     */

    this.getAll = async function() {
        this.verify('getAll');
        console.log(this.queries.getAll)
        return pool.query(this.queries.getAll, []);
    };

    /**
     * Find record by ID.
     *
     * @public
     * @param {String} id
     * @return {Promise} result
     */

    this.select = async function(id) {

        this.verify('select')

        let query = typeof this.queries.select === 'function'
            ? this.queries.select(model.name)
            : this.queries.select;

        return pool.query(
            query, [id],
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
        if (typeof this.queries[key] === 'undefined')
            throw new Error('noquery');
    };

    /**
     * Prepare transaction.
     *
     * @param {String} statements
     * @return {String} SQL transaction
     */

    this.transact = function(statements) {
        return `BEGIN; ${statements} COMMIT;`;
    };

    /**
     * Collate data for INSERT/UPDATE prepared statement.
     *
     * @param {Object} data
     * @return {Object} insertion args
     */

    this.collate = function(data, ignore=[]) {
        let i = 1;
        let cols = []
        let values = [];
        // ignore timestamp fields
        ignore.push('created_at', 'updated_at');

        // filter input data to match insert/update parameters
        Object.entries(data)
            .filter(([key, value]) => {

                // throw error if schema does not have expected field
                if (!model.fields.hasOwnProperty(key)) throw new Error('invalidField');

                // ignore defined fields
                return !ignore.includes(key);
            })
            .forEach(([key, value]) => {
                const datatype = model.fields[key].type;
                dataArr.push(data[key])
                cols.push(`${key}`);
                values.push(`$${i}::${datatype}`);
                i++;
            });

        return {cols: cols, values: values}
    }

}

