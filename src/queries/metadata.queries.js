/*!
 * MLP.API.Services.Queries.Metadata
 * File: metadata.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Database rows limit.
 */

const limit = 50;

/**
 * Query: Get all camera types.
 *
 * @return {Object} query binding
 */

export function getCameras() {
    return {
        sql: `SELECT *
              FROM cameras;`,
        data: [],
    };
}

/**
 * Query: Get all lens types.
 *
 * @return {Object} query binding
 */

export function getLens() {
    return {
        sql: `SELECT *
              FROM lens;`,
        data: [],
    };
}

/**
 * Query: Get all participants for all groups.
 *
 * @return {Object} query binding
 */

export function getParticipants() {
    return {
        sql: `SELECT *
              FROM participants 
              INNER JOIN participant_groups pg 
                  on participants.id = pg.participant_id
              ORDER BY participants.last_name;`,
        data: [],
    };
}







