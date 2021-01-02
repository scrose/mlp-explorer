/*!
 * MLP.API.Services.Queries.SurveySeasons
 * File: survey_seasons.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Find all survey seasons. Joined with surveys table.
 */

export function getAll(_) {
    return function () {
        return {
            sql:`SELECT *, 
                    t1.nodes_id as nodes_id, 
                    t2.nodes_id as owner_id 
                FROM survey_seasons as t1
                LEFT OUTER JOIN surveys as t2 ON
                t1.owner_id = t2.nodes_id;`,
            data: []
        };
    }
}

/**
 * Find survey seasons for a survey. Joined with surveys table.
 */

export function getBySurvey(_) {
    return function () {
        return {
            sql:`SELECT * FROM survey_seasons
            LEFT OUTER JOIN surveys
            ON surveys.id = survey_seasons.owner_id
            WHERE surveys.id = $1::integer`,
            data: []
        };
    }
}
