/*!
 * MLP.API.Services.Queries.HistoricCaptures
 * File: historic_captures.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find historic capture by ID.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all historic captures.
 *
 * @return {Function} query binding function
 */

export function getAll(model) {
    return queries.getAll(model);
}

/**
 * Find historic captures by owner.
 *
 * @param {Object} owner
 * @return {Function} query binding function
 */

export function getByOwner(owner) {
    return function () {
        return {
            sql:`SELECT * FROM historic_captures
            LEFT OUTER JOIN ${owner.table}
            ON historic_captures.owner_id = ${owner.table}.id`,
            data: [owner.id]
        };
    }
}

/**
 * Update historic capture data.
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new historic capture.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete historic capture.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function remove(model) {
    return queries.remove(model);
}

/**
 * Attach historic capture to owner.
 *
 * @return {Function} query binding function
 */

export function attach() {
    return queries.attach();
}

/**
 * Detach historic capture from owner.
 *
 * @return {Function} query binding function
 */

export function detach() {
    return queries.detach();
}

