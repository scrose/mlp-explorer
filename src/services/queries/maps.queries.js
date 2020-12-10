/*!
 * MLP.API.Services.Queries.Maps
 * File: maps.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Attach map to survey season.
 *
 * @return {Object} SQL statement array
 */

export function attach() {
    return queries.attach('survey_seasons');
}

/**
 * Detach map to survey season.
 *
 * @return {Object} SQL statement array
 */

export function detach() {
    return queries.detach('survey_seasons');
}