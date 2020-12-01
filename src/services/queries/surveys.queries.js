/*!
 * MLP.API.Services.Surveys
 * File: surveys.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Find surveyor by ID.
 */

export const findById = `SELECT * 
                            FROM surveys
                            WHERE surveys.id = $1::integer`;

/**
 * Find surveys by surveyor. Joined with surveys table.
 */

export const findBySurveyor = `SELECT * 
                            FROM surveys
                            LEFT OUTER JOIN surveyors
                            ON surveys.surveyor_id = surveyors.id
                         WHERE surveys.id = $1::integer`;

/**
 * Find all surveys. Joined with surveys table.
 */

export const findAll = `SELECT * FROM surveys
                                 LEFT OUTER JOIN surveys
                                 ON surveys.id = surveys.surveyor_id`;

/**
 * Update survey data.
 */

export const update = `UPDATE surveys
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
        `INSERT INTO surveys(last_name,
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
                       FROM surveys
                       WHERE id = $1::varchar
                       RETURNING *`;

/**
 * Initialize surveys table
 */

export const init = {
    create: ``,
    exec: ``
};

