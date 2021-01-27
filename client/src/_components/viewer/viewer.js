/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { genSchema, getRenderType, getStaticRenderType } from '../../_services/schema.services.client';
import { getPath } from '../../_utils/paths.utils.client';
import Messenger from '../common/messenger';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import ViewerMenu from '../menus/viewer.menu';
import DataView from '../views/data.view';
import StaticView from '../views/static.view';
import { useData } from '../../_providers/data.provider.client';
import Heading from '../common/heading';

/**
 * Render viewer panel component (unauthenticated).
 *
 * @public
 */

const Viewer = () => {

    // create dynamic view state
    const [apiData, setAPIData] = React.useState({});
    const [values, setValues] = React.useState(null);
    const route = getPath();
    const api = useData();
    const _isMounted = React.useRef(true);

    // Lookup static view in schema
    const staticRenderType = getStaticRenderType(route) === 'dashboard'
        ? 'dashboardView'
        : getStaticRenderType(route);

    /**
     * Load API data.
     *
     * @public
     */

    const load = async () => {
        let res = await api.get(route)
            .then(res => {
                console.log('API Response:', res);
                return res;
            });

        // update state with response data
        if (_isMounted.current) {
            setAPIData(res);
            const {data={}} = res || {};
            console.log('Data:', data);
            setValues(data);
        }
    }

    // non-static views: fetch API data and set view data in state
    React.useEffect(() => {
        if (_isMounted.current)
            load().catch(err => console.error(err));
        return () => {_isMounted.current = false;};
    }, [load]);

    // destructure API data for settings
    const { view = '', model = {}, data = {}, path = {} } = apiData || {};
    const { name = '', attributes = {} } = model || {};
    const { nodes_id='', users_id='' } = data;
    const id = nodes_id ? nodes_id : users_id ? users_id : '';



    return (
        <div className={'editor'}>
            <div className={'header'}>
                <BreadcrumbMenu path={path} />
                <Messenger />
                <Heading path={path} />
                <ViewerMenu id={id} model={model} view={view} />
            </div>
            {
                staticRenderType
                ? <StaticView type={staticRenderType} />
                : <DataView
                        route={route}
                        id={id}
                        view={view}
                        model={model}
                        values={values}
                        setValues={setValues}
                        schema={genSchema(view, name, attributes)}
                        render={getRenderType(view, name)}
                    />
            }
        </div>
    )
};

export default Viewer;
