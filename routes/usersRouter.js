/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       core.router.users
  Filename:     routes/usersRouter.js
  Description:  Receives HTTP request data and routes to
                appropriate controller for processing.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: September 21, 2020
  ======================================================
*/

const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Users');
});


//
router.get('/', function (req, res) {
  res.send('GET request to the homepage')
})

// POST method route
router.post('/', function (req, res) {
  res.send('POST request to the homepage')
})



module.exports = router;
