/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------
  Module:       Core.DataAPI
  Filename:     db/main.js
  ------------------------------------------------------
  Binding for data layer API - PostgreSQL / pg-promise.
  Key Functionality
  - Binds controllers to data layer / models.
  - Binds pg-promise database queries and data exports.
  - Options for search and node tree export data formats.
  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:      MIT
  Version:      1.0
  Last Updated: September 30, 2020
  ======================================================
*/

'use strict';

const fs = require('fs');

// Breadcrumb menu
module.exports.get_breadcrumbs = function(url) {
    var breadcrumbMenu = [{name: "HOME", url: "/"}],
        acc = "", // accumulative url
        arr = url.substring(1).split("/");

    for (let i=0; i<arr.length; i++) {
        acc = i != arr.length-1 ? acc+"/"+arr[i] : null;
        breadcrumbMenu[i+1] = {name: arr[i].toLowerCase(), url: acc};
    }
    return breadcrumbMenu;
};



// let node_data = {
//     surveyors: [
//
//     ]
// };
//
// let data = JSON.stringify(node_data, null, 2);
//
// fs.writeFile('/views/partials/node_data.json', data, (err) => {
//     if (err) throw err;
//     console.log('Data written to file');
// });
//
// console.log('This is after the write call');