/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Router.Handler
  Description:  Receives HTTP request method and returns
                handler object
  Parameters:   Request data [Request Method]
  Dependencies: n/a
  Interfaces: - Core.Router
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: September 25, 2020
  ======================================================
*/

exports.createHandler = function (method) {
  return new Handler(method);
}

Handler = function(method) {
  this.process = function(req, res) {
    options = null;
    return method.apply(this, [req, res, options]);
  }
}