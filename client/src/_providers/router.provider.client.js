/*!
 * MLP.Client.Providers.Data
 * File: data.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { makeRequest } from '../_services/api.services.client';
import { createNodeRoute, filterPath, reroute, getRoot, createURL } from '../_utils/paths.utils.client';
import { getStaticView } from '../_services/schema.services.client';
import { clearNodes, popSessionMsg } from '../_services/session.services.client';

/**
 * Global data provider.
 *
 * @public
 */

const RouterContext = React.createContext({})

/**
 * Provider component to allow consuming components to subscribe to
 * API request handlers.
 *
 * @public
 * @param {Object} props
 */

function RouterProvider(props) {

    // API status state
    const [online, setOnline] = React.useState(true);

    // current client route in state
    const [currentRoute, setCurrentRoute] = React.useState(filterPath());

    // node filter in state
    const [filter, setFilter] = React.useState({});

    // query filter in state
    const [query, setQuery] = React.useState({});

    // static view state: static views do not require API requests
    const [staticView, setStaticView] = React.useState(getStaticView(filterPath()));

    // clear node path in session state
    clearNodes();

    /**
     * Handle response data.
     *
     * @public
     * @param {Object} res
     */

    const handleResponse = (res) => {

        // No response: API is unavailable
        if (!res) return setOnline(false);

        // return response (and error)
        const { response={} } = res || {};
        const { message={} } = response || {};
        return {error: !res.success ? message : null, response: response};
    }

    /**
     * Router to handle route requests.
     *
     * @public
     * @param {String} uri
     */

    const update = async function(uri) {

        // set app route state
        setCurrentRoute(uri);

        // set static view (if applicable)
        setStaticView(getStaticView(uri));
        setQuery({});

        // clear session messages
        popSessionMsg();

        // update route in browser
        reroute(uri);
    }

    // add history event listener
    window.addEventListener('popstate', function () {

        // get the current URI path
        const uri = window.location.pathname;

        // set app route state
        setCurrentRoute(uri);

        // update route in browser
        reroute(uri);
    });

    /**
     * Data request method to fetch data from API.
     *
     * @public
     * @param {String} route
     *
     * @param params
     */

    const get = async (route, params=null) => {

        // reject null paths or when API is offline
        if (!route || !online ) return null;

        let res = await makeRequest({url: createURL(route, params), method:'GET'})
            .catch(err => {
                // handle API connection errors
                console.error('An API error occurred:', err)
                setOnline(false);
                return null;
            });

        return handleResponse(res);
    };

    /**
     * Request method to post data from API.
     *
     * @public
     *
     * @param {String} route
     * @param {Object} formData
     */

    const post = async (route, formData= null) => {

        // reject null paths or when API is offline
        if (!route || !online ) return null;

        // parse form data
        const parsedData = formData ? Object.fromEntries(formData) : {};

        let res = await makeRequest({
            url: createURL(route),
            method:'POST',
            data: parsedData
        })
            .catch(err => {
                // handle API connection errors
                console.error('An API error occurred:', err);
                setOnline(false);
                return null;
            });

        return handleResponse(res);
    };

    /**
     * Request method to upload file(s) via API.
     *
     * @public
     * @param {String} route
     * @param formData
     * @param callback
     */

    const upload = async (route, formData, callback=()=>{}) => {

        // DEBUG: Display the key/value pairs of form data
        // for(var pair of formData.entries()) {
        //     console.log(pair[0]+ ', '+ pair[1]);
        // }

        console.log('Upload:', route)

        try {

            let xhr = new XMLHttpRequest();
            xhr.open('POST', createURL(route), true);
            xhr.withCredentials = true;
            xhr.responseType = 'json';

            // request finished event
            xhr.onload = function(e) {
                if (xhr.readyState === 4) {
                    const {statusText='An API Error Occurred.'} = e.currentTarget || {};
                    const { response={} } = e.currentTarget || {};
                    const { message={} } = response || {};
                    const {msg=statusText} = message || {};

                    // success
                    if (xhr.status === 200) {
                        return callback(null, {msg: msg, type: 'success'}, response);
                    }
                    // error
                    else {
                        return callback(null, {msg: msg, type: 'error'});
                    }
                }
            };

            // error in sending network request
            xhr.onerror = function(e) {
                const {statusText='API Error Occurred.'} = e.currentTarget || {};
                return callback(null, {msg: statusText, type: 'error'});
            };

            // Upload progress callback
            xhr.upload.onprogress = function(e) {
                return callback(e);
            };

            // Upload error callback
            xhr.upload.onerror = function() {
                return callback(null, {msg: 'Upload error has occurred.', type: 'error'});
            };

            // Upload timeout callback
            xhr.upload.ontimeout = function() {
                return callback(null, {msg: 'Upload has timed out.', type: 'error'});
            };

            // Upload abort callback
            xhr.upload.onabort = function() {
                return callback(null, {msg: 'Upload was aborted.', type: 'warn'});
            };

            // Upload end callback
            xhr.upload.onloadend = function() {
                return callback(null, {msg: 'Upload completed!', type: 'success'});
            };

            // send POST request to server
            xhr.send(formData);

        } catch (err) {
            return callback(null, {msg: 'Submission Failed. Please try again.', type: 'error'});
        }
    };

    /**
     * Request method to download file.
     *
     * @public
     * @param {String} route
     * @param {String} format
     */

    const download = async (route, format) => {

        console.log(route, online)

        // reject null paths or when API is offline
        if (!route || !online ) return null;

        return await makeRequest({url: createURL(route), method:'GET', download: format})
            .then(res => {
                console.log(res)
                if (!res) return null;
                const {error=null} = res || {};
                return {
                    error: error,
                    data: new Blob([res.response])
                }

            })
            .catch(console.error);
    }

    /**
     * Request method to delete node.
     *
     * @public
     * @param {String} id
     * @param {String} model
     * @param {String} group
     * @param {Function} callback
     */

    const remove = async (id, model, group='', callback) => {
        const route = createNodeRoute(model, 'remove', id, group);

        // reject null paths or when API is offline, error found
        if (!route || !online ) return null;

        post(route)
            .then(res => {
                callback(res);
            })
            .catch(console.error);
    }

    /**
     * Provider instance.
     */

    return (
        <RouterContext.Provider value={
            {
                update,
                base: getRoot(),
                route: currentRoute,
                query,
                filter,
                setFilter,
                staticView,
                get,
                post,
                upload,
                download,
                remove,
                online,
                setOnline
            }
        } {...props} />
    )

}

const useRouter = () => React.useContext(RouterContext);
export {useRouter, RouterProvider};
