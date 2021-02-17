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
            },
            '500': () => {
                addSessionMsg({msg: 'Server Error', type:'error'});
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
        const { view='', data={}, model={}, message={msg:'Response Error.', type:'error'} } = res || {};
        const { name='' } = model || {};
        const { nodes_id=''} = data || {};
        const routes = {
            'add': () => {
                addSessionMsg(message);
                const redirectURL = getNodeURI(name, 'show', nodes_id) + '/?msg=true';
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
     * @param {Object} formData
     */

    const post = async (uri, formData= null) => {
        const parsedData = formData ? Object.fromEntries(formData) : {};
        console.log(parsedData)
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
     * @param {Array} formData
     */

    const upload = async (uri, formData= []) => {
        console.log('Upload files:', formData, uri)
        let res = await makeRequest({
            url: getAPIURL(uri),
            method:'POST',
            files: formData
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
     * Request method to delete node.
     *
     * @public
     * @param node
     */

    const remove = async (node) => {
        const route = getNodeURI(node.type, 'remove', node.id);
        post(route)
            .then(res => {
                addSessionMsg(res.message);
                redirect('/');
            })
            .catch(err => console.error(err));
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
                remove,
                followup,
                online,
                setOnline
            }
        } {...props} />
    )

}

const useRouter = () => React.useContext(RouterContext);
export {useRouter, RouterProvider};
