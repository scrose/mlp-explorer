/*!
 * MLP.API.Services.Queries.Visits
 * File: visits.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find visit by ID.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all visits.
 *
 * @return {Function} query binding function
 */

export function getAll(model) {
    return queries.getAll(model);
}

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

/**
 * Update visit data.
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new visit.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete visit.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function remove(model) {
    return queries.remove(model);
}

/**
 * Attach visit to station.
 *
 * @return {Function} query binding function
 */

export function attach() {
    return queries.attach('stations');
}

/**
 * Detach visit from station.
 *
 * @return {Function} query binding function
 */

export function detach() {
    return queries.detach('stations');
}

