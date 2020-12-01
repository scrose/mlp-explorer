/*!
 * MLP.API.DB.Services.Surveys
 * File: surveys.db.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import * as queries from './queries/surveys.queries.js'
import pool from './pgdb.js';

/**
 * Insert survey in database.
 *
 * @public
 * @param {Object} survey
 * @return {Promise} result
 */

export async function insert(survey) {
    let data = survey.getData();
    return pool.query(
        queries.insert,
        [data.surveyor_id, data.name, data.historical_map_sheet],
    );
}


/**
 * Save survey data to existing record in database.
 *
 * @public
 * @param {Object} survey
 * @return {Promise} result
 */

export async function update(survey) {
    let data = survey.getData();
    return pool.query(
        queries.update,
        [data.surveyor_id, data.name, data.historical_map_sheet]
    );
}

/**
 * Find survey by surveyor.
 *
 * @public
 * @param {String} surveyorId
 * @return {Promise} result
 */

export async function selectBySurveyor(surveyorId) {
    return pool.query(
        queries.findBySurveyor,
        [surveyorId]
    );
}

/**
 * Find all surveys.
 *
 * @public
 * @return {Promise} result
 */

export async function getAll() {
    return pool.query(queries.findAll, []);
}

/**
 * Find survey by ID.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

export async function select(id) {
    return pool.query(queries.findById, [id]);
}

/**
 * Remove survey.
 *
 * @public
 * @param {String} id
 * @return {Promise} result
 */

export async function remove(id) {
    return pool.query(queries.remove, [id]);
}

/**
 * Initialize surveys table.
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