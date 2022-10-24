/*!
 * MLP.Client.Providers.Navigation
 * File: nav.provider.client.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import * as React from 'react'
import { useRouter } from './router.provider.client';
import {getNavView, getPref} from "../_services/session.services.client";
import kmlData from '../_components/kml/example-2.kml';

/**
 * Global navigation data provider.
 *
 * @public
 */

const NavContext = React.createContext({});

/**
 * Provider component to allow consuming components to subscribe to
 * API request handlers.
 *
 * @public
 * @param {Object} props
 */

function NavProvider(props) {

    const router = useRouter();

    // tree and map data states
    const [nodeData, setNodeData] = React.useState({});
    const [statsData, setStatsData] = React.useState([]);
    const [mapData, setMapData] = React.useState({});
    const [mapOverlayData, setMapOverlayData] = React.useState(null);
    const [filterData, setFilterData] = React.useState({});
    const [selectedNode, setSelectedNode] = React.useState({});
    const [scrollToView, setScrollToView] = React.useState(false);

    // initialize navigation view settings
    const [navView, setNavView] = React.useState(getNavView() || 'map');
    const [navToggle, setNavToggle] = React.useState(getPref('navToggle') || true);
    const [navOffCanvas, setNavOffCanvas] = React.useState(false);

    // navigator resize signal
    const [resize, setResize] = React.useState(false);

    // navigator data loading error
    const [error, setError] = React.useState(false);

    // Addresses: Can't perform a React state update on unmounted component.
    // This is a no-op, but it indicates a memory leak in your
    // application. To fix, cancel all subscriptions and
    // asynchronous tasks in a useEffect cleanup function.
    const _isMounted = React.useRef(false);

    // refresh navigator data
    const _refresh = () => {
        setNodeData(null);
        setMapData(null);
    }

    // scroll to current tree node
    const _handleScroll = (toggle) => {
        setScrollToView(toggle);
    }

    /**
     * Load API global node tree data.
     * - uses current Window location path as default endpoint.
     *
     * @public
     */

    // API call to retrieve node tree top level
    React.useEffect(() => {
        _isMounted.current = true;
        // proceed if:
        // - no error found (e.g. empty response)
        // - navigator route is defined
        // - node data not yet loaded
        if (!error && (!nodeData || Object.keys(nodeData).length === 0)) {
            // load API data
            router.get('/nodes/tree')
                .then(res => {

                    if (_isMounted.current) {

                        // destructure map data
                        if (res.error) return setError(res.error);
                        const {response={} } = res || {};
                        const { data = {} } = response || {};
                        const { nodes={}, stats=[] } = data || {};

                        // [DEBUG]
                        // console.log('\n<<< Nav [Tree] >>>\n', res)

                        // check if response data is empty (set error flag if true)
                        if ( Object.keys(nodes).length === 0 ) {
                            return setError(true);
                        }

                        // load node data to provider
                        setNodeData(nodes);
                        setStatsData(stats);
                    }
                })
                .catch(err => console.error(err));
        }
        return () => {_isMounted.current = false;};
    }, [router, nodeData, setNodeData, error, setError]);

    // API call to retrieve map data
    React.useEffect(() => {
        _isMounted.current = true;

        // proceed if:
        // - no error found (e.g. empty response)
        // - navigator route is defined
        // - node data not yet loaded
        if (!error && (!mapData || Object.keys(mapData).length === 0)) {
            // load API data
            router.get('/nodes/map')
                .then(res => {

                    if (_isMounted.current) {

                        // destructure map data
                        if (res.error) return setError(res.error);
                        const {response={} } = res || {};
                        const { data = {} } = response || {};
                        const { nodes={} } = data || {};

                        console.log('\n<<< Nav [Map] >>>\n', res)

                        // check if response data is empty (set error flag if true)
                        if ( Object.keys(nodes).length === 0 ) {
                            return setError(true);
                        }

                        // load node data to provider
                        setMapData(nodes);
                    }
                })
                .catch(err => console.error(err));
        }
        return () => {_isMounted.current = false;};
    }, [router, mapData, setMapData, error, setError]);

    // API call to retrieve map KML data
    React.useEffect(() => {
        _isMounted.current = true;
        // proceed if:
        // - no error found (e.g. empty response)
        // - navigator route is defined
        // - KML overlay data not yet loaded

        if (!error && (!mapOverlayData && kmlData)) {

            // load KML map overlay data
            router.getXML(kmlData)
                .then(res => {

                    if (_isMounted.current) {

                        // destructure map data
                        if (res.error) return setError(res.error);

                        // console.log('\n<<< Nav [KML] >>>\n', res)

                        // load node data to provider
                        setMapOverlayData(res);
                    }
                })
                .catch(err => console.error(err));
        }
        return () => {_isMounted.current = false;};
    }, [router, mapOverlayData, setMapOverlayData, error, setError]);

    return (
        <NavContext.Provider value={
            {
                error,
                refresh: _refresh,
                tree: nodeData,
                map: mapData,
                stats: statsData,
                selected: selectedNode,
                setSelected: setSelectedNode,
                filter: filterData,
                overlay: mapOverlayData,
                setFilter: setFilterData,
                hasFilter: Object.keys(filterData).length > 0,
                mode: navView,
                setMode: setNavView,
                offCanvas: navOffCanvas,
                setOffCanvas: setNavOffCanvas,
                scrollToView: scrollToView,
                scroll: _handleScroll,
                toggle: navToggle,
                resize: resize,
                setResize: setResize,
                setToggle: setNavToggle
            }
        } {...props} />
    )

}

const useNav = () => React.useContext(NavContext);
export { useNav, NavProvider };
