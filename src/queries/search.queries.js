/*!
 * MLP.API.Services.Queries.Search
 * File: search.queries.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Query: Get all node types listed.
 *
 * @param {Array} q
 * @return {Object} query binding
 */

export function fulltext(q) {
    let queryString = q.join(' \& ');
    return {
        sql: `
            SELECT
                   n.id as id,
                   n.type as type,
                   modern_visits.date as heading,
                   concat(
                       modern_visits.weather_narrative, 
                       modern_visits.visit_narrative
                       ) as blurb,
                   n.updated_at as last_modified
            FROM modern_visits
                     INNER JOIN nodes n on n.id = modern_visits.nodes_id
            WHERE to_tsvector(
                visit_narrative || ' ' || weather_narrative
                ) @@ to_tsquery($1::varchar)
            ORDER BY n.updated_at DESC
            LIMIT 10;
            `,
        data: [queryString],
    };
}
