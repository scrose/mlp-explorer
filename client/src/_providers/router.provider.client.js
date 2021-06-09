/*!
 * MLP.Client.Providers.Data
 * File: data.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { makeRequest } from '../_services/api.services.client';
import { createNodeRoute, filterPath, reroute, getRoot, createAPIURL } from '../_utils/paths.utils.client';
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

        let res = await makeRequest({url: createAPIURL(route, params), method:'GET'})
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

        console.log(route)

        // reject null paths or when API is offline
        if (!route || !online ) return null;

        console.log(createAPIURL(route))

        // parse form data
        const parsedData = formData ? Object.fromEntries(formData) : {};

        let res = await makeRequest({
            url: createAPIURL(route),
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
                remove,
                online,
                setOnline
            }
        } {...props} />
    )

}

const useRouter = () => React.useContext(RouterContext);
export {useRouter, RouterProvider};
