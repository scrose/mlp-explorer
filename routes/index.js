/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Router
  Description:  Receives HTTP request data and routes to
                appropriate controller for processing.
                Wrapper for setting routes for HTTP requests
  Parameters:   Request data [Controller ID, Action]
  Dependencies: Node JS
  Interfaces: - Core.Controllers
              - Core.UI
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: September 24, 2020
  ======================================================
*/

'use strict';

const users = require('./user')
module.exports = app => {
    app.use('/user', users)
    // etc..
}