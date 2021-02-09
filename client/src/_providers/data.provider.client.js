/*!
 * MLP.Client.Providers.Data
 * File: data.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { useRouter } from './router.provider.client';
import { getRootNode } from '../_utils/data.utils.client';

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

function DataProvider(props) {

    const router = useRouter();

    // API data states
    const [apiData, setAPIData] = React.useState({});
    const [view, setView] = React.useState('');
    const [model, setModel] = React.useState('');
    const [path, setPath] = React.useState([]);

    // Addresses: Can't perform a React state update on unmounted component.
    // This is a no-op, but it indicates a memory leak in your
    // application. To fix, cancel all subscriptions and
    // asynchronous tasks in a useEffect cleanup function.
    const _isMounted = React.useRef(false);

    /**
     * Load API data.
     *
     * @public
     */

    // non-static views: fetch API data and set view data in state
    React.useEffect(() => {
        _isMounted.current = true;

        // request data if not static view
        if (!router.staticView) {
            // set view to loading
            setAPIData({});

            // call API
            router.get(router.route)
                .then(res => {
                    // destructure API data for settings
                    const { data=null, view='', model={}, path={} } = res || {};
                    const { name='' } = model || {};

                    // update states with response data
                    if (_isMounted.current) {
                        setAPIData(data);
                        setView(view);
                        setModel(name);
                        setPath(path);
                    }
                })
                .catch(err => console.error(err));
        }
        return () => {
            _isMounted.current = false;
        };
    }, [router]);

    // get root node in path
    const root = getRootNode(path);

    // set current nodes in path
    const currentNodes = Object.keys(path)
        .map(key => {return path[key].id});

    return (
        <DataContext.Provider value={
            {
                view,
                model,
                path,
                nodes: currentNodes,
                root: root,
                data: apiData,
                setData: setAPIData
            }
        } {...props} />
    )

}

const useData = () => React.useContext(DataContext);
export {useData, DataProvider};
