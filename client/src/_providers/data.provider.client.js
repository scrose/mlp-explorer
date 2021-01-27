/*!
 * MLP.Client.Providers.Data
 * File: data.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { makeRequest } from '../_services/data.services.client';
import { getAPIURL, redirect } from '../_utils/paths.utils.client';
import { addSessionMsg, clearSession } from '../_services/session.services.client';

/**
 * Global authentication context.
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

function DataProvider(props) {

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
                clearSession();
                addSessionMsg(response.message)
                return redirect('/not_found')
            },
            '401': () => {
                clearSession();
                addSessionMsg(response.message)
                return redirect('/login')
            },
            '403': () => {
                clearSession();
                addSessionMsg(response.message)
                return redirect('/login')
            },
            '500': () => {
                clearSession();
                addSessionMsg(response.message)
                return redirect('/')
            }
        }
        return routes.hasOwnProperty(status)
            ? routes[status]()
            : response;
    }

    /**
     * Data request method to fetch data from API.
     *
     * @public
     * @param {String} route
     *
     */
    const get = React.useCallback(async (route) => {

        return await makeRequest({url: getAPIURL(route), method:'GET'})
            .then(res => {
                const { response } = res;
                // handle exceptions
                if (!res.success)
                    return errorRouter(res.status, response);
                return response;

            })
            .catch(err => {
                console.error('An API error occurred:', err)
            });

    }, []);

    /**
     * Request method to post data from API.
     *
     * @public
     * @param {String} route
     * @param {Object} payload
     */

    const post = async function(route, payload) {
        return await makeRequest({url: route, method:'POST', data: payload})
            .then(res => {
                // get content portion of fetched response data
                const { response } = res;
                // handle exceptions
                if (!res.success)
                    return errorRouter(res.status, response);

                return response;

            })
            .catch(err => {
                console.error('An API error occurred:', err)
            });
    }

    return (
        <DataContext.Provider value={
            {
                get,
                post
            }
        } {...props} />
    )

}

const useData = () => React.useContext(DataContext);
export {useData, DataProvider};
