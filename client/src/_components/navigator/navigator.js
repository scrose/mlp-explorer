/*!
 * MLP.Client.Components.Navigator
 * File: navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react'
import MenuNavigator from './menu.navigator';
import TreeNavigator from './tree.navigator';
import MapNavigator from './map.navigator';
import { getNavView } from '../../_services/session.services.client';
import Dialog from '../common/dialog';
import FilterNavigator from './filter.navigator';
import { useRouter } from '../../_providers/router.provider.client';
import ServerError from '../error/server.error';
import SearchNavigator from './search.navigator';
import Loading from '../common/loading';
import Button from '../common/button';

/**
 * Main navigator component.
 *
 * @public
 * @return {JSX.Element}
 */

const Navigator = () => {

    const router = useRouter();

    // initialize navigation view settings
    const [navView, setNavView] = React.useState(getNavView() || 'tree');
    const [navToggle, setNavToggle] = React.useState(true);
    const [filterToggle, setFilterToggle] = React.useState(false);

    // node data state
    const [nodeData, setNodeData] = React.useState({});
    const [optionsData, setOptionsData] = React.useState({});
    const [filterData, setFilterData] = React.useState({});

    // data loading error
    const [error, setError] = React.useState(false);
    const _isMounted = React.useRef(false);

    // Data API endpoints
    const routes = {
        tree: '/nodes/tree',
        map: '/nodes/map',
        search: null
    }
    const route = routes.hasOwnProperty(navView) ? routes[navView] : null;

    const navViews = {
        hidden: <></>,
        tree: <TreeNavigator view={navView} data={nodeData} filter={filterData} />,
        map: <MapNavigator view={navView} data={nodeData} filter={filterData} />,
        search: <SearchNavigator view={navView} data={nodeData} filter={filterData} />
    }

    // API call to retrieve node tree top level
    React.useEffect(() => {
        _isMounted.current = true;
        // proceed if:
        // - no error found (e.g. empty response)
        // - navigator route is defined
        // - node data not yet loaded
        if (!error && route && (!nodeData || Object.keys(nodeData).length === 0)) {
            router.get(route)
                .then(res => {

                    if (_isMounted.current) {

                        // destructure map data
                        if (res.error) return setError(res.error);
                        const {response={} } = res || {};
                        const { data = {} } = response || {};
                        const { options={}, nodes={} } = data || {};

                        // check if response data is empty (set error flag if true)
                        if ( Object.keys(nodes).length === 0 ) {
                            return setError(true);
                        }

                        // load options and node data to provider
                        setOptionsData(options)
                        setNodeData(nodes);
                    }
                })
                .catch(err => console.error(err));
        }
        return () => {_isMounted.current = false;};
    }, [router, route, nodeData, setNodeData, setOptionsData, error, setError]);

    return  (
        !error
            ? <div id={'navigator'} className={`navigator${!navToggle ? ' hidden' : ''}`}>
                <MenuNavigator
                    view={navView}
                    set={setNavView}
                    toggle={navToggle}
                    setToggle={setNavToggle}
                    setData={setNodeData}
                    setFilter={setFilterToggle}
                    filtered={Object.keys(filterData).length > 0}
                />
                {
                    filterToggle
                        ?   <Dialog
                                title={`Filter Map Stations`}
                                setToggle={setFilterToggle}>
                                    <FilterNavigator
                                        data={filterData}
                                        setData={setFilterData}
                                        optionsData={optionsData}
                                        setToggle={setFilterToggle}
                                    />
                            </Dialog>
                        : ''
                }
                {
                    error
                        ? <Button className={'msg error'} label={'An error occurred'} icon={'error'} />
                        : navView
                        ? ( navToggle ? navViews[navView] : navViews.hidden )
                        : <Loading />
                }
            </div>
            : <ServerError/>
        )
}

export default Navigator;