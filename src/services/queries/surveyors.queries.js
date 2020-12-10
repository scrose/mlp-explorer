/*!
 * MLP.API.Services.Queries.Surveyors
 * File: surveyors.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find surveyor by ID.
 *
 * @param {Object} model
 * @return {Function} query function
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all surveyors. Joined with surveys table.
 *
 *  @return {Function} query function
 */

export function getAll(_) {
    return queries.getAll(_);
}

/**
 * Find surveyors by survey. Joined with surveys table.
 *
 * @return {Function} query function
 */

export function getBySurvey(_) {
    return function (survey_id) {
        return {
            sql:`SELECT * FROM surveyors
            LEFT OUTER JOIN surveys
            ON surveys.owner_id = surveyors.id
            WHERE surveys.id = $1::integer`,
            data: [survey_id]
        };
    }
}

/**
 * Update surveyor data.
 *
 * @param {Object} model
 * @return {Function} query function
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new surveyor. (Uses transaction)
 *
 * @param {Object} model
 * @return {Function} query functions
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete surveyor.
 *
 * @param {Object} model
 * @return {Function} query function
 */

export function remove(model) {
    return queries.remove(model);
}
