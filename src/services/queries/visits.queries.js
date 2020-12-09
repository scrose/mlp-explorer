/*!
 * MLP.API.Services.Visits
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

export function getAll(_) {
    return function () {
        return {
            sql:`SELECT * FROM visits;`,
            data: []
        };
    }
}

/**
 * Find visits by owner.
 *
 * @param {Object} owner
 * @return {Function} query binding function
 */

export function getByOwner(owner) {
    return function () {
        return {
            sql:`SELECT * FROM visits
            LEFT OUTER JOIN surveyors
            ON visits.owner_id = ${owner.name}.id
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
 * Attach visit to owner.
 *
 * @return {Function} query binding function
 */

export function attach() {
    return queries.attach();
}

/**
 * Detach visit from owner.
 *
 * @return {Function} query binding function
 */

export function detach() {
    return queries.detach();
}

