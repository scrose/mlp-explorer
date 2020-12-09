/*!
 * MLP.API.Services.Queries.Captures
 * File: captures.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find capture by ID.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all captures.
 *
 * @return {Function} query binding function
 */

export function getAll(model) {
    return queries.getAll(model);
}

/**
 * Find captures by owner.
 *
 * @param {Object} owner
 * @return {Function} query binding function
 */

export function getByOwner(owner) {
    return queries.findByOwner(model);
}

/**
 * Update capture data.
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new capture.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete capture.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function remove(model) {
    return queries.remove(model);
}

/**
 * Attach capture to owner.
 *
 * @return {Function} query binding function
 */

export function attach() {
    return queries.attach();
}

/**
 * Detach capture from owner.
 *
 * @return {Function} query binding function
 */

export function detach() {
    return queries.detach();
}

