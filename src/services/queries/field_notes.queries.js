/*!
 * MLP.API.Services.Queries.FieldNotes
 * File: field_notes.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

import * as queries from '../queries.services.js';

/**
 * Find field note by ID.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function select(model) {
    return queries.select(model);
}

/**
 * Find all field notes.
 *
 * @return {Function} query binding function
 */

export function getAll(model) {
    return queries.getAll(model);
}

/**
 * Find field notes by owner.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function getByOwner(model) {
    return queries.findByOwner(model);
}

/**
 * Update field note data.
 */

export function update(model) {
    return queries.update(model);
}

/**
 * Insert new field note.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function insert(model) {
    return queries.insert(model);
}

/**
 * Delete field note.
 *
 * @param {Object} model
 * @return {Function} query binding function
 */

export function remove(model) {
    return queries.remove(model);
}


/**
 * Attach field note to visit.
 *
 * @return {Object} SQL statement array
 */

export function attach() {
    return queries.attach('survey_seasons');
}

/**
 * Detach field note to visit.
 *
 * @return {Object} SQL statement array
 */

export function detach() {
    return queries.detach('survey_seasons');
}