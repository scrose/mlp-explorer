/*!
 * MLP.API.Services.Queries.HistoricVisits
 * File: historic_visits.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';


/**
 * Find all visits. Joined with stations table.
 *
 * @return {Function} query binding function
 */

export function getAll(_) {
    return function () {
        return {
            sql:`SELECT *, 
                    t1.nodes_id as nodes_id, 
                    t2.nodes_id as owner_id 
                FROM historic_visits as t1
                LEFT OUTER JOIN stations as t2 ON
                t1.owner_id = t2.nodes_id;`,
            data: []
        };
    }
}


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
