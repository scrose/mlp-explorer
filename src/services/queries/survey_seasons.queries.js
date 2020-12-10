/*!
 * MLP.API.Services.Queries.SurveySeasons
 * File: survey_seasons.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find all survey seasons. Joined with surveys table.
 */

export function getAll(_) {
    return function () {
        return {
            sql:`SELECT * FROM survey_seasons 
                LEFT OUTER JOIN surveys ON
                survey_seasons.owner_id = surveys.id;`,
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

/**
 * Attach survey season to survey.
 *
 * @return {Object} SQL statement array
 */

export function attach() {
    return queries.attach('surveys');
}

/**
 * Detach survey season from survey.
 *
 * @return {Object} SQL statement array
 */

export function detach() {
    return queries.detach('surveys');
}

