/*!
 * MLE.Client.Providers.Data
 * File: data.provider.client.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import * as React from 'react'
import {loadXML, makeRequest} from '../_services/api.services.client';
import {createNodeRoute, filterPath, reroute, getRoot, createAPIURL } from '../_utils/paths.utils.client';
import { getStaticView } from '../_services/schema.services.client';
import { popSessionMsg } from '../_services/session.services.client';

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

    // Update router states on re-render
    React.useEffect(() => {
        const routeUpdater = function () {

            // get the current URI path
            const uri = window.location.pathname;

            // set app route state
            setCurrentRoute(uri);
            setStaticView(getStaticView(filterPath()));

            // update route in browser
            reroute(uri);
        }
        // add history event listener
        window.addEventListener('popstate', routeUpdater);
        return () => {
            window.removeEventListener('popstate', routeUpdater);
        };
    });


    /**
     * Handle response data.
     *
     * @public
     * @param {Object} res
     */

    const handleResponse = (res) => {

        // No response: API is unavailable
        //if (!res) return setOnline(false);

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
     * Data request method to fetch data from API.
     *
     * @public
     * @param {String} route
     *
     * @param params
     */

    const getXML = async (route, params=null) => {

        // reject null paths or when API is offline
        if (!route || !online ) return null;
        return await loadXML(route);
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
     * @param {Function} callback
     */

    const remove = async (id, model, callback) => {
        const route = createNodeRoute(model, 'remove', id);

        // reject null paths or when API is offline, error found
        if (!route || !online ) return null;
        post(route).then(callback).catch(console.error);
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
                getXML,
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
