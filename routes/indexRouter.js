/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       routes > index
  Description:  Receives HTTP request data and routes to
                appropriate controller for processing.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: September 21, 2020
  ------------------------------------------------------
  Module:       core.router.index
  Filename:     /indexRouter.js
  ======================================================
*/

// const express = require('express');
// const router = express.Router();
//
// /* GET users listing. */
// router.get('/', function(req, res, next) {
//     res.send('This is the main page.');
// });

exports.router = function () {
    return Date();
};