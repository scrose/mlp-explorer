/**
 * Module dependencies.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = function(parent, options){
    const controllers_dir = path.join(__dirname, '..', 'controllers');
    const verbose = options.verbose;
    // Read files in controllers directory
    fs.readdirSync(controllers_dir).forEach(function(dir_name){
        const file = path.join(controllers_dir, dir_name)
        if (!fs.statSync(file).isDirectory()) return;
        verbose && console.log('\n   %s:', dir_name);
        var obj = require(file);
        var name = obj.name || dir_name;
        var prefix = obj.prefix || '';
        var app = express();
        var handler;
        var method;
        var url;

        // allow specifying the view engine
        if (obj.engine) app.set('view engine', obj.engine);
        app.set('views', path.join(__dirname, '..', 'controllers', name, 'views'));

        // generate routes based
        // on the exported methods
        for (var file_key in obj) {
            // "reserved" exports
            if (~['name', 'prefix', 'engine', 'before'].indexOf(file_key)) continue;
            // route exports
            switch (file_key) {
                case 'show':
                    method = 'get';
                    url = '/' + name + '/:' + name + '_id';
                    break;
                case 'list':
                    method = 'get';
                    url = '/' + name + 's';
                    break;
                case 'edit':
                    method = 'get';
                    url = '/' + name + '/:' + name + '_id/edit';
                    break;
                case 'update':
                    method = 'put';
                    url = '/' + name + '/:' + name + '_id';
                    break;
                case 'create':
                    method = 'post';
                    url = '/' + name;
                    break;
                case 'index':
                    method = 'get';
                    url = '/';
                    break;
                default:
                    /* istanbul ignore next */
                    throw new Error('unrecognized route: ' + name + '.' + file_key);
            }

            // setup
            handler = obj[file_key];
            url = prefix + url;

            // before middleware support
            if (obj.before) {
                app[method](url, obj.before, handler);
                verbose && console.log('     %s %s -> before -> %s', method.toUpperCase(), url, file_key);
            } else {
                app[method](url, handler);
                verbose && console.log('     %s %s -> %s', method.toUpperCase(), url, file_key);
            }
        }

        // mount the app
        parent.use(app);
    });
};

