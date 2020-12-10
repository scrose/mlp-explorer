/*!
 * MLP.API.Services.Queries.Projects
 * File: projects.queries.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Find all projects. Joined with surveys table.
 *
 *  @return {Function} query function
 */

export function getAll(_) {
    return function () {
        return {
            sql:`SELECT *, projects.id AS id FROM projects 
                LEFT JOIN surveys ON 
                    surveys.owner_id = projects.id;`,
            data: []
        };
    }
}

/**
 * Find projects by station. Joined with stations table.
 *
 * @return {Function} query function
 */

export function getByStation(_) {
    return function (station_id) {
        return {
            sql:`SELECT * FROM projects
            LEFT OUTER JOIN stations
            ON stations.owner_id = projects.id
            WHERE stations.id = $1::integer`,
            data: [station_id]
        };
    }
}