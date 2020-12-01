/*!
 * MLP.API.DB.Services.Surveyors
 * File: surveyors.db.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import * as queries from './queries/surveyors.queries.js'
import pool from './pgdb.js';

/**
 * Insert surveyor in database.
 *
 * @public
 * @param {Object} surveyor
 * @return {Promise} result
 */

export async function insert(surveyor) {
    let data = surveyor.getData();
    return pool.query(
        queries.insert,
        [data.last_name, data.given_names, data.short_name, data.affiliation],
    );
}

/**
 * Save surveyor data to existing record in database.
 *
 * @public
 * @param {Object} surveyor
 * @return {Promise} result
 */

export async function update(surveyor) {
    let data = surveyor.getData();
    return pool.query(
        queries.update,
        [data.last_name, data.given_names, data.short_name, data.affiliation]
    );
}

/**
 * Find surveyor by survey.
 *
 * @public
 * @param {String} surveyId
 * @return {Promise} result
 */

export async function selectBySurvey(surveyId) {
    return pool.query(
        queries.findBySurvey,
        [surveyId]
    );
}

/**
 * Find all surveyors.
 *
 * @public
 * @return {Promise} result
 */

export async function getAll() {
    return pool.query(queries.findAll, []);
}

/**
 * Find surveyor by surveyor ID.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

export async function select(id) {
    return pool.query(queries.findById, [id]);
}

/**
 * Remove surveyor.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

export async function remove(id) {
    return pool.query(queries.remove, [id]);
}

/**
 * Initialize surveyors table.
 *
 * @public
 * @return {Promise} result
 */

export async function init(data) {

    // create pgsql PL function
    await pool.query(queries.init.create, []);

    // execute function
    return pool.query(queries.init.exec, data);
}