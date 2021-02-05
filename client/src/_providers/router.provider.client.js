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
import { useMessenger } from './messenger.provider.client';
import { addSessionMsg } from '../_services/session.services.client';

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
    const [route, setRoute] = React.useState(filterPath());

    // client node path in state
    const [path, setPath] = React.useState(filterPath());

    // static view state: static views do not require API requests
    const [staticView, setStaticView] = React.useState(getStaticView(filterPath()));

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

        // set app route state
        setRoute(uri);

        // clear message
        msg.setMessage(null);

        // reroute view
        reroute(uri);
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
                return redirect('/not_found');
            },
            '401': () => {
                return redirect('/login');
            },
            '403': () => {
                return redirect('/login');
            }
        }
        return routes.hasOwnProperty(status) ? routes[status]() : response;
    }

    /**
     * Redirection router.
     *
     * @public
     * @param res
     */

    const followup = (res) => {
        const { view='', data={}, model={} } = res || {};
        const { name='' } = model || {};
        const { nodes_id=''} = data || {};
        const routes = {
            'add': () => {
                addSessionMsg(res.message);
                const redirectURL = getNodeURI(model.name, 'show', data.nodes_id) + '/?msg=true';
                return redirect(redirectURL);
            }
        }
        return routes.hasOwnProperty(view) ? routes[view]() : res;
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

    const post = async (uri, payload= {}) => {
        let res = await makeRequest({url: getAPIURL(uri), method:'POST', data: payload})
            .catch(err => {
                // handle API connection errors
                console.error('An API error occurred:', err);
                setOnline(false);
                return null;
            });
        return res ? handleResponse(res) : res;
    };

    /**
     * Request method to delate node.
     *
     * @public
     * @param node
     */

    const remove = async (node) => {
        const route = getNodeURI(node.type, 'remove', node.id);
        post(route)
            .then(res => {
                console.log('Deletion response:', res);
                addSessionMsg(res.message);
                const redirectURL = getNodeURI(node.owner_type, 'show', node.owner_id) + '/?msg=true';
                redirect(redirectURL);
            })
            .catch(err => console.error(err));
    }

    /**
     * Provider instance.
     */

    return (
        <DataContext.Provider value={
            {
                router,
                route,
                staticView,
                get,
                post,
                remove,
                followup,
                online,
                setOnline
            }
        } {...props} />
    )

}

const useRouter = () => React.useContext(DataContext);
export {useRouter, RouterProvider};
