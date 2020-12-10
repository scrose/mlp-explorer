/*!
 * MLP.API.Services.Queries.Surveyors
 * File: surveyors.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

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