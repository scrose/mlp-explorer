/*!
 * MLP.API.Services.Queries
 * File: index.services.js
 * Copyright(c) 2020 Runtime Software Development Inc.
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
import * as visits from './visits.queries.js';
import * as historicVisits from './historic_visits.queries.js';
import * as locations from './locations.queries.js';
import * as captures from './captures.queries.js';
import * as historicCaptures from './historic_captures.queries.js';


/**
 * Index of module exports.
 * @public
 */

export default {
    defaults: defaults,
    users: users,
    sessions: sessions,
    projects: projects,
    surveyors: surveyors,
    surveys: surveys,
    surveySeasons: surveySeasons,
    stations: stations,
    visits: visits,
    historicVisits: historicVisits,
    locations: locations,
    captures: captures,
    historicCaptures: historicCaptures
};
