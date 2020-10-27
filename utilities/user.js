/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.Utilities.Data
  File:         /utilities/data.js
  ------------------------------------------------------
  Utility methods for handling data
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: October 9, 2020
  ======================================================
*/

'use strict';
const date = require('./date');

// Determine if user is currently logged-in
exports.setLoggedIn = function setLoggedIn( userList ) {
    const timestamp = Date.now();
    userList.forEach((user) => {
        // check if current sign in timestamp is the same as the last sign in timestamp
        user.loggedIn = ( !!user.current_sign_in_at && !!user.last_sign_in_at  &&
             date.convert(user.last_sign_in_at).valueOf() !== date.convert(user.current_sign_in_at).valueOf() );
    });
    return userList;
};

