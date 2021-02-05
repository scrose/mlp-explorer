/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getRenderType, getStaticView } from '../../_services/schema.services.client';
import Messenger from '../common/messenger';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import MenuViewer from './menu.viewer';
import DataView from '../views/data.view';
import StaticView from '../views/static.view';
import { useRouter } from '../../_providers/router.provider.client';
import Heading from '../common/heading';
import { getRootNode } from '../../_utils/data.utils.client';

/**
 * Render viewer panel component (unauthenticated).
 *
 * @public
 */

const Viewer = () => {

    // create dynamic view state
    const [apiData, setAPIData] = React.useState({});

    // get router context provider
    const api = useRouter();

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
        if (!api.staticView)
            api.get(api.route)
                .then(data => {
                    console.log('API Response:', data);

                    // update state with response data
                    if (_isMounted.current)
                        setAPIData(data);
                });
        return () => {_isMounted.current = false;};
    }, [api]);

    // destructure API data for settings
    const { view = '', model = {}, path = {} } = apiData || {};
    const { name = '' } = model || {};
    const node = getRootNode(path);

    return (
        <div className={'viewer'}>
            <div className={'header'}>
                <BreadcrumbMenu path={path} view={view} model={name} />
                <Messenger />
                <MenuViewer view={view} node={node} />
                <Heading node={node} />
            </div>
            {
                api.staticView
                ? <StaticView type={
                    api.staticView === 'dashboard' ? 'dashboardView' : api.staticView
                } />
                : <DataView
                        view={view}
                        model={name}
                        data={apiData}
                        setData={setAPIData}
                        render={getRenderType(view, name)}
                    />
            }
        </div>
    )
};

export default Viewer;
