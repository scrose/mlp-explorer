/*!
 * MLP.API.Models.Survey
 * File: survey.models.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import schema from './schemas/surveys.schema.js';
import { createModel } from './composer.services.js';

/**
 * Create Survey data model. Build by composition.
 *
 * @private
 * @param data
 */

let Survey = createModel(schema);

/**
 * Module exports.
 * @public
 */

export default Survey;