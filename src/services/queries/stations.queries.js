/*!
 * MLP.API.Services.Stations
 * File: stations.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find station by ID.
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all stations.
 */

export function getAll(_) {
    return function () {
        return {
            sql:`SELECT * FROM stations;`,
            data: []
        };
    }
}

/**
 * Find stations by owner.
 */

export function getByOwner(owner, owner_id) {
    return function () {
        return {
            sql:`SELECT * FROM stations
            LEFT OUTER JOIN surveyors
            ON stations.owner_id = ${owner}.id
            WHERE ${owner}.id = $1::integer`,
            data: [owner_id]
        };
    }
}

/**
 * Update surveyor data.
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new station.
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete station.
 */

export function remove(model) {
    return queries.remove(model);
}

