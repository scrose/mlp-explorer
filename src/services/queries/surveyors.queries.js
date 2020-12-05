/*!
 * MLP.API.Services.Surveyors
 * File: surveyors.queries.js
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
            sql:`SELECT * FROM surveyors 
                LEFT OUTER JOIN surveys ON 
                    surveys.parent_id = surveyors.id 
                    AND
                    surveys.parent_type_id = 
                    (SELECT id FROM node_types WHERE node_types.name='surveyors')`,
            data: []
        };
    }
}

/**
 * Find surveyors by survey. Joined with surveys table.
 */

export function getBySurvey(_) {
    return function () {
        return {
            sql:`SELECT * FROM surveyors
            LEFT OUTER JOIN surveys
            ON surveys.parent_id = surveyors.id
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

