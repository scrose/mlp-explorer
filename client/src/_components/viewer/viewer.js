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

/**
 * Render viewer panel component (unauthenticated).
 *
 * @public
 */

const Viewer = () => {

    // create dynamic view state
    const [apiData, setAPIData] = React.useState({});
    const api = useRouter();

    /**
     * Load API data.
     *
     * @public
     */

    // non-static views: fetch API data and set view data in state
    React.useEffect(() => {
        console.log('Static View:', api.staticView)
        if (!api.staticView)
            api.get(api.route)
                .then(data => {
                    console.log('API Response:', data);
                    // update state with response data
                    setAPIData(data);
                });
        return () => {};
    }, [api]);

    // destructure API data for settings
    const { view = '', model = {}, data = {}, path = {} } = apiData || {};
    const { name = '' } = model || {};
    const { nodes_id='', users_id='' } = data;
    const id = nodes_id ? nodes_id : users_id ? users_id : '';

    return (
        <div className={'viewer'}>
            <div className={'header'}>
                <BreadcrumbMenu path={path} />
                <Messenger />
                <MenuViewer id={id} model={model} view={view} />
                <Heading path={path} />
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
