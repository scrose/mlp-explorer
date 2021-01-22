/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { genSchema, getStaticRenderType, getRenderType } from '../../_services/schema.services.client';
import { getPath } from '../../_utils/paths.utils.client';
import { useData } from '../../_providers/data.provider.client';
import Messenger from '../common/messenger';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import MenuViewer from './menu.viewer';
import View from '../common/view';

/**
 * Build requested view from API data.
 *
 * @param {String} route
 * @public
 */

const DataView = ({route}) => {

    // create dynamic view state
    const [schema, setSchema] = React.useState(null);
    const [values, setValues] = React.useState({});
    const [renderType, setRenderType] = React.useState('');

    // get data API provider
    const api = useData();

    // non-static views: fetch API data and set view data in state
    React.useEffect(() => {
        api.get(route)
            .then(res => {
                // lookup view in schema
                const { view = '', model = {}, data = {} } = res || {};
                const { name = '', attributes = {} } = model;

                // get the view render type defined in schema
                const rType = getRenderType(view, name);
                setRenderType(rType);

                // set the requested view schema
                setSchema(genSchema(view, name, attributes));
                setValues(data);

                console.log('Data View: \n Render Type: %s\nAPI Response: %s', getRenderType(view, model), res);
                console.log('Schema:', genSchema(view, name, attributes))
            });
    }, [api, route, setSchema, setRenderType, renderType]);

    // select default callback for view
    const callback = api.post;

    return <View route={route} type={renderType} schema={schema} data={values} callback={callback} />
}

/**
 * Build viewer panel.
 *
 * @public
 */

/**
 * Render editor panel component (authenticated).
 *
 * @public
 */

const Viewer = () => {
    const route = getPath();

    // Lookup static view in schema
    const staticType = getStaticRenderType(route) === 'dashboard'
        ? 'dashboardView'
        : getStaticRenderType(route);

    return (
        <div className={'editor'}>
            <BreadcrumbMenu />
            <Messenger />
            <MenuViewer />
            {
                staticType
                ? <View type={staticType} />
                : <DataView route={route}/>
            }
        </div>
    )
};

export default Viewer;
