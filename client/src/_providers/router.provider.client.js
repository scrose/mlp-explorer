/*!
 * MLP.Client.Providers.Data
 * File: data.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { makeRequest } from '../_services/api.services.client';
import { getAPIURL, getPath, reroute } from '../_utils/paths.utils.client';
import { getStaticView } from '../_services/schema.services.client';
import { useMessenger } from './messenger.provider.client';

/**
 * Global data provider.
 *
 * @public
 */

const DataContext = React.createContext({})

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
    const [route, setRoute] = React.useState(getPath());

    // static view state: static views do not require API requests
    const [staticView, setStaticView] = React.useState(getStaticView(getPath()));

    // get messenger
    const msg = useMessenger();

    /**
     * Router to handle route requests.
     *
     * @public
     * @param {String} uri
     */

    const router = async function(uri) {
        // set static view (if applicable)
        setStaticView(getStaticView(uri));

        // clear messages
        msg.setMessage(null)

        // set app route state
        setRoute(uri);

        // reroute view
        reroute(uri);

        console.log('New static view:', getStaticView(uri))
    }

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
                return '/not_found'
            },
            '401': () => {
                return '/login'
            },
            '403': () => {
                return '/login'
            },
            '500': () => {
                return '/'
            }
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
     * @param {Object} payload
     */

    const post = async (uri, payload) => {
        let res = await makeRequest({url: getAPIURL(uri), method:'POST', data: payload})
            .catch(err => {
                // handle API connection errors
                console.error('An API error occurred:', err);
                setOnline(false);
                return null;
            });
        return res ? handleResponse(res) : res;
    };

    return (
        <DataContext.Provider value={
            {
                router,
                route,
                staticView,
                get,
                post,
                online,
                setOnline
            }
        } {...props} />
    )

}

const useRouter = () => React.useContext(DataContext);
export {useRouter, RouterProvider};
