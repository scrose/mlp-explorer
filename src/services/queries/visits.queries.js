/*!
 * MLP.API.Services.Queries.Vists
 * File: visits.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';


/**
 * Update survey data.
 */

export const update = `UPDATE visits
                       SET last_name = $2::text,
                           given_names = $3::text,
                           short_name = $4::text,
                           affiliation = $5::text,
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


