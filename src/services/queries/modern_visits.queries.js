/*!
 * MLP.API.Services.Queries.Visits
 * File: modern_visits.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.db.services.js';

/**
 * Find visits by station.
 *
 * @param {int} station_id
 * @return {Function} query binding function
 */

export function getByStation(station_id) {
    return function () {
        return {
            sql:`SELECT * FROM visits
            LEFT OUTER JOIN stations
            ON visits.owner_id = $1::integer`,
            data: [station_id]
        };
    }
}

