/*!
 * MLP.Client.Providers.Data
 * File: data.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { makeRequest } from '../_services/data.services.client';
import { useMsg } from './msg.provider.client';
import { redirect } from '../_utils/paths.utils.client';
import { addMsg } from '../_services/session.services.client';

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

    let [data, setData] = React.useState({});

    /**
     * Error router.
     *
     * @public
     * @param {String} status
     */

    const errorRouter = (status) => {
        const routes = {
            '404': () => {
                return redirect('/not_found')
            },
            '401': () => {
                return redirect('/login')
            },
            '403': () => {
                return redirect('/login')
            }
        }

        return routes.hasOwnProperty(status) ? routes[status]() : null;
    }

    /**
     * Data request method to fetch data from API.
     *
     * @public
     * @param {String} route

     */
    const get = async function(route) {
        return await makeRequest({url: route, method:'GET'})
            .then(res => {
                const { response } = res;
                // add messages to storage
                addMsg(response.message)
                // handle exceptions
                if (!res.success)
                    return errorRouter(res.status);
                return response;
            })
            .catch(err => {
                console.error('An API error occurred:', err)
            });
    }

    /**
     * Request method to post data from API.
     *
     * @public
     * @param {String} route
     * @param {Object} data
     */

    const post = async function(route, data) {
        return await makeRequest({url: route, method:'POST', data: data})
            .then(res => {
                const { response } = res;
                // add messages to storage
                addMsg(response.message)
                // handle exceptions
                if (!res.success)
                    return errorRouter(res.status);
                return response;
            })
            .catch(err => {
                console.error('An API error occurred:', err)
            });
    }

    return (
        <DataContext.Provider value={{data, get, post}} {...props} />
    )

}

const useData = () => React.useContext(DataContext);
export {useData, DataProvider};
