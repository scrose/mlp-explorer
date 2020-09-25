/*
  ======================================================
  Mountain Legacy Project: Explorer Application
  ------------------------------------------------------

  ------------------------------------------------------
  Creator:      Spencer Rose
  Copyright:    (c) 2020 Runtime Software Development Inc.
  License:
  Version:      1.0
  Last Updated: June 15, 2020
  ------------------------------------------------------
  Module:       Core.Uploader
  Filename:     /file.js
  ======================================================
*/

// Initialization
'use strict';
const http = require('http');


// function loadJSON(callback, path) {
//
//     var xobj = new XMLHttpRequest();
//     xobj.overrideMimeType("application/json");
//     xobj.open('GET', path, true);
//     xobj.onreadystatechange = function () {
//         if (xobj.readyState === 4 && xobj.status === 200) {
//             // Required use of an anonymous callback as .open will NOT
//             // return a value but simply returns undefined in asynchronous mode
//             callback(xobj.responseText);
//         }
//     };
//     xobj.send(null);
// }

exports.getJSON = function getJSON(url, callback) {
    // let xhr = new XMLHttpRequest();
    // xhr.onload = function () {
    //     callback(this.responseText)
    // };
    // xhr.open('GET', url, true);
    // xhr.send();
}

exports.loadJSON =  function loadJSON(url, callback) {
    exports.getJSON(url, data => callback(JSON.parse(data)));
}

