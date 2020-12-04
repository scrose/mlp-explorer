/*!
 * MLP.API.Services.Surveyors
 * File: surveyors.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services';

/**
 * Find surveyor by ID.
 */

export function select(model) {
    return queries.select(model.name);
}

/**
 * Find all surveys. Joined with surveys table.
 */

export function getAll(model) {
    return `SELECT * FROM ${model.name} 
                LEFT OUTER JOIN surveys
                ON surveys.surveyor_id = surveyors.id`;
}

/**
 * Find surveyors by survey. Joined with surveys table.
 */

export function getBySurvey(model) {
    return `SELECT * FROM ${model.name} 
                LEFT OUTER JOIN surveys
                ON surveys.surveyor_id = surveyors.id
                 WHERE surveyors.id = $1::integer`;
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

