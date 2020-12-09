/*!
 * MLP.API.Services.Queries.Locations
 * File: locations.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find location by ID.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all locations.
 *
 * @return {Function} query binding function
 */

export function getAll(model) {
    return queries.getAll(model);
}

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

/**
 * Update location data.
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new location.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete location.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function remove(model) {
    return queries.remove(model);
}

/**
 * Attach location to visit.
 *
 * @return {Function} query binding function
 */

export function attach() {
    return queries.attach('stations');
}

/**
 * Detach location from visit.
 *
 * @return {Function} query binding function
 */

export function detach() {
    return queries.detach('stations');
}

