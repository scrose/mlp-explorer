/*!
 * MLP.API.Services.Queries.Stations
 * File: stations.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';


/**
 * Find stations by owner.
 *
 * @param {Object} owner
 * @return {Function} query binding function
 */

export function getByOwner(owner) {
    return function () {
        return {
            sql:`SELECT * FROM stations
            LEFT OUTER JOIN ${owner.table}
            ON stations.owner_id = ${owner.table}.id
            WHERE ${owner.table}.id = $1::integer`,
            data: [owner.id]
        };
    }
}

/**
 * Attach station to owner.
 *
 * @return {Function} query binding function
 */

export function attach() {
    return queries.attach();
}

/**
 * Detach station from owner.
 *
 * @return {Function} query binding function
 */

export function detach() {
    return queries.detach();
}

