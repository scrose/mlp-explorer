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
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all stations.
 *
 * @return {Function} query binding function
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
 *
 * @param {Object} owner
 * @return {Function} query binding function
 */

export function getByOwner(owner) {
    return function () {
        return {
            sql:`SELECT * FROM stations
            LEFT OUTER JOIN surveyors
            ON stations.owner_id = ${owner.name}.id
            WHERE ${owner}.id = $1::integer`,
            data: [owner.id]
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
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete station.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function remove(model) {
    return queries.remove(model);
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

