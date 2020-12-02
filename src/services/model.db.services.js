/*!
 * MLP.API.DB.Services.Models
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
import queries from './queries/index.queries.js'

/**
 * Export services constructor
 *
 * @public
 * @param {Object} table
 * @return {Promise} result
 */

export default function Services(table) {

    // check table exists
    if ( typeof queries[table] === 'undefined' )
        throw new Error('notable')

    this.table = table;

    /**
     * Insert record into table.
     *
     * @public
     * @param {Object} table
     * @return {Promise} result
     */

    this.insert = async function(data) {
        this.verify('insert');
        return pool.query(
            queries[this.table].insert, data
        );
    }

    /**
     * Update data in existing record.
     *
     * @public
     * @param {Object} user
     * @return {Promise} result
     */

    this.update = async function(data) {
        this.verify('update');
        return pool.query(queries[this.table].update, data);
    }

    /**
     * Find all records.
     *
     * @public
     * @return {Promise} result
     */

    this.getAll = async function() {
        this.verify('getAll');
        return pool.query(queries[this.table].findAll, []);
    }

    /**
     * Find record by ID.
     *
     * @public
     * @param {String} id
     * @return {Promise} result
     */

    this.select = async function(id) {
        this.verify('select');
        return pool.query(queries[this.table].findById, [id]);
    }

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
    }

    /**
     * Initialize table.
     *
     * @public
     * @return {Promise} result
     */

    this.init = async function(data) {

        // create pgsql PL function
        await pool.query(queries[this.table].init.create, []);

        // execute function
        return pool.query(queries[this.table].init.exec, data);
    }

    /**
     * Verify table/query exists for model. Throws error if not found.
     *
     * @public
     */

    this.verify = function(key) {

        if ( !queries[this.table].hasOwnProperty(key) )
            throw new Error('noquery')
    }

}

