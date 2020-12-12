/*!
 * MLP.API.Services.Queries.Surveys
 * File: surveys.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

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
                    surveys.owner_id = surveyors.id;`,
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
            ON surveys.owner_id = surveyors.id`,
            data: [id]
        };
    }
}

