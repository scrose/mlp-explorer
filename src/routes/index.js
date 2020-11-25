/*!
 * Core.API.Router
 * File: /src/routes/index.test.js
 * Copyright(c) 2020 Runtime Software Development Inc.
 * MIT Licensed
 */

import express from 'express';
const apiRouter = express.Router();

// import { modifyMessage } from '../middleware';
//
// indexRouter.post('/messages', modifyMessage, addMessage);

import * as users from '../controllers/users.controller.js';

apiRouter.get('/', function (req, res, next) {
  return res.status(200).json({ message: 'Welcome to Express API template' });
});

apiRouter.get('/users', users.list);
apiRouter.get('/users/:user_id', users.show);

export default apiRouter;

//
// // Module dependencies
// const express = require('express');
// const fs = require('fs');
// const path = require('path');
//
// module.exports = function addRoutes(parent, options){
//     const controllersDir = path.join(__dirname, '..', 'controllers');
//     const verbose = options.verbose;
//
//     // Read files in controllers directory
//     fs.readdirSync(controllersDir).forEach(function(fileName){
//         let handler, method, url;
//         const file = path.basename(fileName,path.extname(fileName));
//         const filePath = path.join(controllersDir, fileName)
//         verbose && console.log('\n   %s [%s]: %s', fileName, file, filePath);
//         const obj = require(filePath);
//         const name = obj.name || file;
//         const prefix = obj.prefix || '';
//         var router = express.Router();
//
//         // Specify view engine
//         const viewsDir = path.join(__dirname, '..', 'views', file)
//         app.set('views', viewsDir);
//         console.log('     View: %s', viewsDir);
//
//         // generate routes based on the exported methods
//         for (const file_key in obj) {
//             // "reserved" exports
//             if (~['name', 'prefix', 'engine', 'before'].indexOf(file_key)) continue;
//             // route exports
//             switch (file_key) {
//                 case 'show':
//                     method = 'get';
//                     url = '/' + name + '/:' + name + '_id';
//                     break;
//                 case 'list':
//                     method = 'get';
//                     url = '/' + name;
//                     break;
//                 case 'edit':
//                     method = 'get';
//                     url = '/' + name + '/:' + name + '_id/edit';
//                     break;
//                 case 'update':
//                     method = 'post';
//                     url = '/' + name + '/:' + name + '_id/edit';
//                     break;
//                 case 'create':
//                     method = 'get';
//                     url = '/' + name + '/create';
//                     break;
//                 case 'insert':
//                     method = 'post';
//                     url = '/' + name + '/insert';
//                     break;
//                 case 'remove':
//                     method = 'get';
//                     url = '/' + name + '/:' + name + '_id/delete';
//                     break;
//                 case 'delete':
//                     method = 'post';
//                     url = '/' + name + '/:' + name + '_id/delete';
//                     break;
//                 case 'register':
//                     method = 'get';
//                     url = '/users/register';
//                     break;
//                 case 'confirm':
//                     method = 'post';
//                     url = '/users/register';
//                     break;
//                 case 'login':
//                     method = 'get';
//                     url = '/login';
//                     break;
//                 case 'authenticate':
//                     method = 'post';
//                     url = '/login';
//                     break;
//                 case 'logout':
//                     method = 'get';
//                     url = '/logout';
//                     break;
//                 case 'index':
//                     method = 'get';
//                     url = '/';
//                     break;
//                 default:
//                     /* istanbul ignore next */
//                     throw new Error('unrecognized route: ' + name + '.' + file_key);
//             }
//
//             // setup
//             handler = obj[file_key];
//             url = prefix + url;
//
//             // before middleware support
//             if (obj.before) {
//                 app[method](url, obj.before, handler);
//                 verbose && console.log('     %s %s -> before -> %s', method.toUpperCase(), url, file_key);
//             } else {
//                 app[method](url, handler);
//                 verbose && console.log('     %s %s -> %s', method.toUpperCase(), url, file_key);
//             }
//         }
//
//         // mount the app
//         parent.use(app);
//     });
// };
//
