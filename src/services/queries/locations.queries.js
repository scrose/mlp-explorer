/*!
 * MLP.API.Services.Queries.Locations
 * File: locations.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';


/**
 * Find locations by visit.
 *
 * @param {int} visit_id
 * @return {Function} query binding function
 */

export function getByVisit(visit_id) {
    return function () {
        return {
            sql:`SELECT * FROM locations
            LEFT OUTER JOIN visits
            ON locations.owner_id = $1::integer`,
            data: [visit_id]
        };
    }
}