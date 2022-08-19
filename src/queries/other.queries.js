/*!
 * MLP.API.Services.Queries.Other
 * File: other.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Query: Get showcase images from designated project
 * - selects unsorted capture images stored under a project
 *   with the key descriptor 'showcase'.
 * - capture images are used for the frontpage carousel
 *
 * @return {Object} query binding
 */

export function showcase() {
    let sql = `
            SELECT * 
            FROM nodes 
            WHERE nodes.owner_id = (
                SELECT nodes_id 
                FROM projects 
                WHERE projects.description = 'showcase'
            )
            ;`
    // let sql = `SELECT * FROM projects WHERE projects.description = 'showcase';`
    return {
        sql: sql,
        data: [],
    };
}


