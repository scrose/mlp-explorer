/*!
 * MLP.API.Services.Queries.HistoricVisits
 * File: historic_visits.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Find historic visits by station.
 *
 * @param {int} station_id
 * @return {Function} query binding function
 */

export function getByStation(station_id) {
    return function () {
        return {
            sql:`SELECT * FROM historic_visits
            LEFT OUTER JOIN stations
            ON historic_visits.owner_id = $1::integer`,
            data: [station_id]
        };
    }
}
