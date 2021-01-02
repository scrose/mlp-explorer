/*!
 * Core.API.Router
 * File: index.routes.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import express from 'express';
const router = express.Router();
import mainRoutes from './main.routes.js'
import userRoutes from './users.routes.js'
import modelRoutes from './models.routes.js'
import uploadRoutes from './files.routes.js'

/**
 * Include routers.
 */

router.use('/', mainRoutes);
router.use('/', userRoutes);
router.use('/', modelRoutes);
router.use('/', uploadRoutes);

export default router;