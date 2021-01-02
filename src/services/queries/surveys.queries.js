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
            sql:`SELECT *, 
                    t1.nodes_id as nodes_id, 
                    t2.nodes_id as owner_id 
                FROM surveys as t1
                LEFT OUTER JOIN surveyors as t2 ON
                t1.owner_id = t2.nodes_id;`,
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

