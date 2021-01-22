/*!
 * MLP.Client.Components.Editor
 * File: editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { genSchema, getStaticRenderType, getRenderType } from '../../_services/schema.services.client';
import { getPath } from '../../_utils/paths.utils.client';
import { useData } from '../../_providers/data.provider.client';
import Messenger from '../common/messenger';
import MenuEditor from './menu.editor';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import View from '../common/view';
import Heading from '../common/heading';

/**
 * Build requested editor panel from API data.
 *
 * @param {String} route
 * @public
 */

const DataView = ({ route}) => {

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

                setRenderType(getRenderType(view, name));
                console.log('Render Type:', getRenderType(view, model));
                console.log('API Response:', res);
                console.log('API Data:', data)

                setSchema(genSchema(view, name, attributes));
                console.log('Schema:', genSchema(view, name, attributes))
                setValues(data);

            });
    }, [api, route, setSchema, setRenderType, renderType]);

    // select default callback for view
    const callback = api.post;

    // get view, model settings from schema
    const { model={}, attributes={} } = schema || {};
    const { label='' } = attributes || {};

    return (
        <>
            <Heading model={model} text={label}/>
            <View route={route} type={renderType} schema={schema} data={values} callback={callback} />
        </>
    )
}

/**
 * Render editor panel component (authenticated).
 *
 * @public
 */

const Editor = () => {
    const route = getPath();

    // Lookup static view in schema
    const staticType = getStaticRenderType(route) === 'dashboard'
        ? 'dashboardEdit'
        : getStaticRenderType(route);

    return (
        <div className={'editor'}>
            <BreadcrumbMenu />
            <Messenger />
            <MenuEditor />
            {
                staticType
                    ? <View type={staticType}/>
                    : <DataView route={route}/>
            }
        </div>
    )
};

export default Editor;
