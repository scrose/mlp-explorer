/*!
 * MLP.API.Services.SurveySeasons
 * File: survey_seasons.queries.js
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
 * Find all survey seasons. Joined with surveys table.
 */

export function getAll(_) {
    return function () {
        return {
            sql:`SELECT * FROM survey_seasons 
                LEFT OUTER JOIN surveys ON
                survey_seasons.survey_id = surveys.id;`,
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
            ON surveys.id = survey_seasons.survey_id
            WHERE surveys.id = $1::integer`,
            data: []
        };
    }
}

/**
 * Update survey season data.
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new survey season.
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete survey season.
 */

export function remove(model) {
    return queries.remove(model);
}

