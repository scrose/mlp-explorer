// Utility functions


'use strict';

function loadJSON(path) {
    const fs = require('fs');
    let rawdata = fs.readFileSync(path);
    return JSON.parse(rawdata)
}

module.exports.loadJSON = loadJSON;






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

// function getJSON(url, callback) {
//     let xhr = new XMLHttpRequest();
//     xhr.onload = function () {
//         callback(this.responseText)
//     };
//     xhr.open('GET', url, true);
//     xhr.send();
// }
//
// export function getUsefulContents(url, callback) {
//     getJSON(url, data => callback(JSON.parse(data)));
// }

