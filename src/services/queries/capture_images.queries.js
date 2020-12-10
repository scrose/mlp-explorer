/*!
 * MLP.API.Services.Queries.CaptureImages
 * File: capture_images.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find capture image by ID.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all capture images.
 *
 * @return {Function} query binding function
 */

export function getAll(model) {
    return queries.getAll(model);
}

/**
 * Find capture images by owner.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function getByOwner(model) {
    return queries.findByOwner(model);
}

/**
 * Update capture image data.
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new capture image.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete capture image.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function remove(model) {
    return queries.remove(model);
}

/**
 * Attach capture image to owner.
 *
 * @return {Function} query binding function
 */

export function attach() {
    return queries.attach();
}

/**
 * Detach capture image from owner.
 *
 * @return {Function} query binding function
 */

export function detach() {
    return queries.detach();
}

