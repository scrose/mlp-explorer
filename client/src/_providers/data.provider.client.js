/*!
 * MLP.Client.Providers.Data
 * File: data.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { useRouter } from './router.provider.client';
import { getRootNode } from '../_utils/data.utils.client';
import { setSessionMsg } from '../_services/session.services.client';
import { useUser } from './user.provider.client';

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
    const user= useUser();

    // API data states
    const [apiData, setAPIData] = React.useState({});
    const [view, setView] = React.useState('');
    const [model, setModel] = React.useState('');
    const [attributes, setAttributes] = React.useState({});
    const [options, setOptions] = React.useState({});
    const [path, setPath] = React.useState([]);

    // data error
    const [error, setError] = React.useState(false);

    // Addresses: Can't perform a React state update on unmounted component.
    // This is a no-op, but it indicates a memory leak in your
    // application. To fix, cancel all subscriptions and
    // asynchronous tasks in a useEffect cleanup function.
    const _isMounted = React.useRef(false);

    // destructure API data object
    const destructure = (dataObj) => {
        const {
            label='',
            metadata={},
            node = {},
            file = {},
            files={},
            dependents={},
            attached={}} = dataObj || {};
        const type = node.type || file.file_type || '';
        const id = node.id || file.id || '';

        // get current owner
        const {owner_id='', owner_type=''} = node || {};
        const owner = owner_type && owner_id
            ? { id: owner_id, type: owner_type }
            : null;

        // check if label is empty, if so, use root node label
        const labelAlt = label ? label : getRootNode(path).label;

        return {
            id: id,
            type: type,
            label: labelAlt,
            metadata: metadata,
            node: node,
            file: file,
            files: files,
            dependents: dependents,
            attached: attached,
            owner: owner
        }
    }


    /**
     * Load metadata options / settings data.
     * - uses current Window location path as default endpoint.
     *
     * @public
     */

    const loadOptions = React.useCallback((type='options') => {
        router.get(`/${type}`)
            .then(res => {
                if (!res) return null;
                console.log('\nOptions >>>\n', res);
                if (res.error) return setError(res.error);
                // destructure API data for options
                const { response = {} } = res || {};
                const { data = {}, message = {} } = response || {};
                // update states with response data
                if (message.type === 'error') setSessionMsg(message);
                setOptions(data);
            })
            .catch(err => console.error(err));
    }, [router, setOptions, setError]);

    /**
     * Load API data.
     * - uses current Window location path as default endpoint.
     *
     * @public
     */

    // non-static views: fetch API global options
    React.useEffect(() => {
        _isMounted.current = true;

        // call API for metadata options (if user is logged in)
        if (user && Object.keys(options).length === 0) {
            if (_isMounted.current) {
                loadOptions();
            }
        }
        return () => {
            _isMounted.current = false;
        }
    }, [user, options, loadOptions])

    // non-static views: fetch API data and set view data in state
    React.useEffect(() => {
        _isMounted.current = true;
        setError(null);

        // request data if not static view
        if (!router.staticView && router.online) {
            // set view to loading
            setAPIData({});
            setView('');
            setModel('');

            // call API for page data
            router.get(router.route)
                .then(res => {
                    if (!res) return null;
                    const { response={} } = res || {};

                    console.log('\n>>> Response >>>\n', res)

                    // destructure API data for settings
                    const {
                        data=null,
                        view='',
                        model={},
                        path={},
                        message={}
                    } = response || {};
                    const { name='', attributes={} } = model || {};

                    // check if response data is empty (set error flag to true)
                    if ( res && res.error ) {
                        setError(message);
                    }

                    // update states with response data
                    if (_isMounted.current) {
                        setAttributes(attributes);
                        setAPIData(data);
                        setView(view);
                        setModel(name);
                        setPath(path);
                        setSessionMsg(message);
                    }
                })
                .catch(err => console.error(err));

        }
        return () => {
            _isMounted.current = false;
        };
    }, [router]);

    // destructure API data
    const root = getRootNode(path);
    const {
        id,
        type,
        label,
        metadata,
        dependents,
        owner
    } = destructure(apiData);

    // provide current path node IDs
    const currentNodes = Object.keys((path || {}))
        .map(key => {
            const {node={}} = path[key] || {};
            const {id=''} = node || {};
            return id
        });

    return (
        <DataContext.Provider value={
            {
                view,
                model,
                path,
                nodes: currentNodes,
                root,
                data: apiData,
                error,
                label,
                type,
                id,
                owner,
                metadata,
                attributes,
                dependents,
                options,
                setOptions,
                loadOptions,
                destructure
            }
        } {...props} />
    )

}

const useData = () => React.useContext(DataContext);
export {useData, DataProvider};
