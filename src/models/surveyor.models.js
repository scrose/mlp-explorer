/*!
 * MLP.API.Models.Surveyors
 * File: surveyors.models.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

import schema from './schemas/surveyors.schema.js';
import { createModel } from './composer.services.js';

/**
 * Create Surveyor data model. Build by composition.
 *
 * @private
 * @param data
 */

let Surveyor = createModel(schema);

/**
 * Module exports.
 * @public
 */

export default Surveyor;