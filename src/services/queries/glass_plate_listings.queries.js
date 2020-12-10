/*!
 * MLP.API.Services.Queries.GlassPlateListings
 * File: glass_plate_listings.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find glass plates by ID.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all glass plate listings.
 *
 * @return {Function} query binding function
 */

export function getAll(model) {
    return queries.getAll(model);
}

/**
 * Find glass plates by owner.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function getByOwner(model) {
    return queries.findByOwner(model);
}

/**
 * Update glass plate data.
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new glass plate.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete glass plate.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function remove(model) {
    return queries.remove(model);
}

/**
 * Attach glass plate listing to survey season.
 *
 * @return {Object} SQL statement array
 */

export function attach() {
    return queries.attach('survey_seasons');
}

/**
 * Detach survey to survey season.
 *
 * @return {Object} SQL statement array
 */

export function detach() {
    return queries.detach('survey_seasons');
}