/*!
 * Core.API.Router.Users
 * File: users.routes.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */


/**
 * Module dependencies
 */

import * as users from '../controllers/users.controller.js'
import path from 'path';

/**
 * Users routes
 * @public
 */

let routes = new UserRoutes();
export default routes;

/**
 * Model user routes constructor
 *
 * @public
 */

function UserRoutes() {

    // create model identifier key
    this.model = 'users';
    this.key = 'user_id';

    // initialize model controller
    this.controller = users;

    // add controller routes
    this.routes = {
        list: {
            path: path.join('/', this.model),
            get: this.controller.list,
            put: null,
            post: null,
            delete: null,
        },
        register: {
            path: path.join('/', this.model, 'register'),
            get: this.controller.register,
            put: null,
            post: this.controller.create,
            delete: null,
        },
        show: {
            path: path.join('/', this.model, '/:' + this.key),
            get: this.controller.show,
            put: null,
            post: null,
            delete: null,
        },
        edit: {
            path: path.join('/', this.model, '/:' + this.key, 'edit'),
            get: this.controller.edit,
            put: null,
            post: this.controller.update,
            delete: null,
        },
        remove: {
            path: path.join('/', this.model, '/:' + this.key, 'remove'),
            get: this.controller.remove,
            put: null,
            post: this.controller.drop,
            delete: null,
        },
        login: {
            path: path.join('/login'),
            get: null,
            put: null,
            post: this.controller.login,
            delete: null,
        },
        auth: {
            path: path.join('/auth'),
            get: null,
            put: null,
            post: this.controller.authenticate,
            delete: null,
        }
    };
}
