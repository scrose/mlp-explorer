/*!
 * MLP.API.Services.Queries
 * File: index.services.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import * as defaults from '../queries.services.js';
import * as users from './users.queries.js';
import * as sessions from './sessions.queries.js';
import * as projects from './projects.queries.js';
import * as surveyors from './surveyors.queries.js';
import * as surveys from './surveys.queries.js';
import * as surveySeasons from './survey_seasons.queries.js';
import * as stations from './stations.queries.js';
import * as modernVisits from './modern_visits.queries.js';
import * as historicVisits from './historic_visits.queries.js';
import * as locations from './locations.queries.js';
import * as historicCaptures from './historic_captures.queries.js';
import * as modernCaptures from './modern_captures.queries.js';
import * as historicImages from './historic_images.queries.js';
import * as modernImages from './modern_images.queries.js';
import * as supplementalImages from './supplemental_images.queries.js';

/**
 * Index of module exports.
 * @public
 */

export default {
    defaults: {
        getAll: defaults.getAll,
        select: defaults.select,
        // append: defaults.append,
        insert: defaults.insert,
        update: defaults.update,
        remove: defaults.remove,
        selectNode: defaults.selectNode,
        insertNode: defaults.insertNode,
        updateNode: defaults.updateNode,
        removeNode: defaults.removeNode,
        selectFile: defaults.selectFile,
        insertFile: defaults.insertFile,
        updateFile: defaults.updateFile,
        removeFile: defaults.removeFile
    },
    schema: {
        getNode: defaults.getNode,
        getNodeTypes: defaults.getNodeTypes,
        getFile: defaults.getFile,
        getFileTypes: defaults.getFileTypes,
        getAttachedFiles: defaults.getAttachedFiles,
        getTables: defaults.getTables,
        getColumns: defaults.getColumns,
        getPermissions: defaults.getPermissions
    },
    users: users,
    sessions: sessions,
    projects: projects,
    surveyors: surveyors,
    surveys: surveys,
    surveySeasons: surveySeasons,
    stations: stations,
    modernVisits: modernVisits,
    historicVisits: historicVisits,
    modernCaptures: modernCaptures,
    historicCaptures: historicCaptures,
    locations: locations,
    historicImages: historicImages,
    modernImages: modernImages,
    supplementalImages: supplementalImages
};
