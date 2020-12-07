/*!
 * MLP.API.Services.Surveys
 * File: surveys.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find surveyor by ID.
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all surveyors. Joined with surveys table.
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
 */

export function getBySurveyor(_) {
    return function () {
        return {
            sql:`SELECT * FROM surveys
            LEFT OUTER JOIN surveyors
            ON surveys.surveyor_id = surveyors.id
            WHERE surveyors.id = $1::integer`,
            data: []
        };
    }
}

/**
 * Update surveyor data.
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new surveyor.
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete surveyor.
 */

export function remove(model) {
    return queries.remove(model);
}

