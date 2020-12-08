/*!
 * MLP.API.Services.Queries.Surveys
 * File: surveys.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find survey by ID.
 *
 * @param {Object} model
 * @return {Function} SQL query function
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all surveys. Joined with surveyors table.
 *
 * @return {Function} SQL query function
 */

export function getAll(_) {
    return function () {
        return {
            sql:`SELECT * FROM surveys 
                LEFT OUTER JOIN surveyors ON 
                    surveys.surveyor_id = surveyors.id;`,
            data: []
        };
    }
}

/**
 * Find surveys by surveyor. Joined with surveyors table.
 *
 * @return {Function} SQL query function
 */

export function getBySurveyor(_) {
    return function (id) {
        return {
            sql:`SELECT * FROM surveys
            LEFT OUTER JOIN surveyors
            ON surveys.surveyor_id = surveyors.id
            WHERE surveyors.id = $1::integer`,
            data: [id]
        };
    }
}

/**
 * Update survey data.
 *
 * @param {Object} model
 * @return {Function} SQL query function
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new survey.
 *
 * @param {Object} model
 * @return {Array} SQL statement array
 */

export function insert(model) {
    return [
        queries.insertNode({

        }),
        queries.insert(model)
    ];
}

/**
 * Delete survey.
 *
 * @param {Object} model
 * @return {Object} SQL statement array
 */

export function remove(model) {
    return queries.remove(model);
}

