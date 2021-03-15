/*!
 * MLP.Client.Providers.Data
 * File: data.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { makeRequest } from '../_services/api.services.client';
import { getAPIURL, getNodeURI, filterPath, redirect, reroute } from '../_utils/paths.utils.client';
import { getStaticView } from '../_services/schema.services.client';
import { addSessionMsg, clearNodes } from '../_services/session.services.client';

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

    // client route in state
    const [route, setRoute] = React.useState(filterPath());

    // static view state: static views do not require API requests
    const [staticView, setStaticView] = React.useState(getStaticView(filterPath()));

    // clear node path in session state
    clearNodes();

    /**
     * Router to handle route requests.
     *
     * @public
     * @param {String} uri
     */

    const update = async function(uri) {

        // set static view (if applicable)
        setStaticView(getStaticView(uri));

        // set app route state
        setRoute(uri);

        // update route in browser
        reroute(uri);
    }

    // add history event listener
    window.addEventListener('popstate', function (e) {

        // get the current URI path
        const uri = window.location.pathname;

        // set app route state
        setRoute(uri);

        // update route in browser
        reroute(uri);
    });

    /**
     * Error router.
     *
     * @public
     * @param status
     * @param response
     */

    const errorRouter = (status, response) => {
        const routes = {
            '404': () => {
                return update('/not_found');
            },
            // '401': () => {
            //     return redirect('/login');
            // },
            '403': () => {
                return update('/login');
            },
            // '500': () => {
            //     addSessionMsg({msg: 'Server Error', type:'error'});
            // }
        }
        return routes.hasOwnProperty(status) ? routes[status]() : response;
    }

    /**
     * Router to handle route requests.
     *
     * @public
     * @param {Object} res
     */

    const handleResponse = (res) => {

        // get content portion of fetched response data
        const { response } = res || {};

        // handle exceptions
        if (!res.success) {
            response.reroute = errorRouter(res.status, response);
        }

        return response;
    }

    /**
     * Data request method to fetch data from API.
     *
     * @public
     * @param {String} uri
     *
     */
    const get = async (uri) => {
        let res = await makeRequest({url: getAPIURL(uri), method:'GET'})
            .catch(err => {
                // handle API connection errors
                console.error('An API error occurred:', err)
                setOnline(false);
                return null;
            });
        return res ? handleResponse(res) : res;
    };

    /**
     * Request method to post data from API.
     *
     * @public
     * @param {String} uri
     * @param {Object} formData
     */

    const post = async (uri, formData= null) => {
        const parsedData = formData ? Object.fromEntries(formData) : {};

        let res = await makeRequest({
            url: getAPIURL(uri),
            method:'POST',
            data: parsedData
        })
            .catch(err => {
                // handle API connection errors
                console.error('An API error occurred:', err);
                setOnline(false);
                return null;
            });
        return res ? handleResponse(res) : res;
    };

    /**
     * Request method to upload file(s) via API.
     *
     * @public
     * @param {String} uri
     * @param formData
     * @param callback
     */

    const upload = async (uri, formData, callback=()=>{}) => {

        // DEBUG: Display the key/value pairs of form data
        // for(var pair of formData.entries()) {
        //     console.log(pair[0]+ ', '+ pair[1]);
        // }
        // console.log('Route:', uri)

        try {

            let xhr = new XMLHttpRequest();
            xhr.open('POST', uri, true);
            xhr.responseType = 'json';

            // request finished event
            xhr.onload = function(e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const { response } = e.currentTarget || {};
                        const { message } = response || {};
                        const {msg='Update Successful.'} = message || {};
                        return callback(null, {msg: msg, type: 'success'}, response);
                    }
                    else {
                        const {statusText='API Error Occurred.'} = e.currentTarget || {};
                        return callback(null, {msg: statusText, type: 'error'});
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
            xhr.upload.onerror = function(e) {
                return callback(null, {msg: 'Upload error has occurred.', type: 'error'});
            };

            // Upload timeout callback
            xhr.upload.ontimeout = function(e) {
                return callback(null, {msg: 'Upload has timed out.', type: 'error'});
            };

            // Upload abort callback
            xhr.upload.onabort = function(e) {
                return callback(null, {msg: 'Upload was aborted.', type: 'warn'});
            };

            // Upload end callback
            xhr.upload.onloadend = function(e) {
                return callback(null, {msg: 'Upload completed!', type: 'success'});
            };

            // send POST request to server
            xhr.send(formData);

        } catch (err) {
            console.log(err);
        }
    };

    /**
     * Request method to delete node.
     *
     * @public
     * @param model
     * @param id
     */

    const remove = async (model, id) => {
        const route = getNodeURI(model, 'remove', id);
        post(route)
            .then(res => {
                addSessionMsg(res.message);
                redirect('/');
            })
            .catch(console.error);
    }

    /**
     * Request method to download file.
     *
     * @public
     * @param uri
     * @param format
     */

    const download = async (uri, format) => {
        return await makeRequest({url: getAPIURL(uri), method:'GET', download: format})
            .then(res => {
                return new Blob([res.response]);
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
                route,
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
