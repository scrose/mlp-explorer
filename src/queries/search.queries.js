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
 * @param {Integer} limit
 * @param {Integer} offset
 * @return {Object} query binding
 */

export function fulltext(q, offset=0, limit=10) {
    let queryString = q.join(' \& ');
    return {
        sql: `
            WITH mv as (
                SELECT
                   nodes_id as id,
                   date as heading,
                   concat(
                       weather_narrative, 
                       visit_narrative
                       ) as blurb
                FROM modern_visits
                WHERE to_tsvector(
                    visit_narrative || ' ' || weather_narrative
                    ) @@ to_tsquery($1::varchar)
                GROUP BY id, heading, blurb
            )
            SELECT 
                   mv.id, 
                   mv.heading, 
                   mv.blurb, 
                   n.type as type,
                   n.updated_at as last_modified,
                   (SELECT COUNT(*) FROM mv) as total
            FROM mv
            JOIN nodes n ON n.id = mv.id
            GROUP BY 
                     mv.id, 
                     mv.heading, 
                     mv.blurb,
                     type,
                     last_modified
            ORDER BY last_modified DESC
            OFFSET ${offset}
            LIMIT ${limit};
            `,
        data: [queryString],
    };
}
