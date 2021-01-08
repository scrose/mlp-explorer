/*!
 * Core.API.Router
 * File: index.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies
 */

import express from 'express'
import * as main from '../controllers/main.controller.js';

/**
 * Express router
 */

let router = express.Router();
export default router;

/**
 * Frontpage.
 */

router.get('/', main.index);
