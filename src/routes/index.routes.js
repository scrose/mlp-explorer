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

/**
 * Include routers.
 */

router.use('/api', mainRoutes);
router.use('/api', userRoutes);

export default router;