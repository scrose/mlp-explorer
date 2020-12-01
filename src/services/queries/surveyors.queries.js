/*!
 * MLP.API.Services.Surveyors
 * File: surveyors.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Find surveyor by ID.
 */

export const findById = `SELECT * 
                            FROM surveyors
                            WHERE surveyors.id = $1::integer`;

/**
 * Find surveyors by survey. Joined with surveys table.
 */

export const findBySurvey = `SELECT * 
                            FROM surveyors
                            LEFT OUTER JOIN surveys
                            ON surveyors.id = surveys.surveyor_id
                         WHERE surveys.id = $1::integer`;

/**
 * Find all survyeors. Joined with surveys table.
 */

export const findAll = `SELECT * FROM surveyors
                                 LEFT OUTER JOIN surveys
                                 ON surveyors.id = surveys.surveyor_id`;

/**
 * Update survey data.
 */

export const update = `UPDATE surveyors
                       SET last_name = $2::text,
                           given_names = $3::text,
                           short_name = $2::text,
                           affiliation = $2::text,
                           updated_at = NOW()::timestamp
                       WHERE user_id = $1::integer
                       RETURNING *`;

/**
 * Insert new surveyor.
 */

export const insert =
        `INSERT INTO surveyors(last_name,
                           given_names,
                           short_name,
                           affiliation,
                           created_at,
                           updated_at)
         VALUES ($1::text,
                 $2::text,
                 $3::text,
                 $4::text,
                 NOW()::timestamp,
                 NOW()::timestamp)
         RETURNING id`;

/**
 * Delete user.
 */

export const remove = `DELETE
                       FROM surveyors
                       WHERE id = $1::varchar
                       RETURNING *`;

/**
 * Initialize surveyors table
 */

export const init = {
    create: ``,
    exec: ``
};

