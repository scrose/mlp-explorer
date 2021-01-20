/*!
 * MLP.Client.Components.Editor
 * File: editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Form from '../common/form';
import Notfound from '../error/notfound';
import { genSchema, getStaticView, getRenderType } from '../../_services/schema.services.client';
import LogoutUsers from '../users/logout.users';
import LoginUsers from '../users/login.users';
import { getPath } from '../../_utils/paths.utils.client';
import DashboardEditor from './dashboard.editor';
import { useData } from '../../_providers/data.provider.client';
import Loading from '../common/loading';
import Table from '../common/table';
import Messenger from '../common/messenger';
import Heading from '../common/heading';
import MenuEditor from './menu.editor';
import ListUsers from '../users/list.users';
import BreadcrumbMenu from '../common/breadcrumb.menu';

/**
 * Render non-static view component.
 *
 * @public
 * @param { route, viewType, viewData, callback }
 * @return {React.Component}
 */

const renderView = ({ route, renderType, schema, values, callback }) => {

    // destructure data fields from schema (Optional)
    const { fields = [] } = schema || {};

    // view components indexed by render type
    const viewComponents = {
        'form': () => <Form route={route} schema={schema} callback={callback} />,
        'item': () => <div>Item View</div>,
        'list': () => <Table rows={values || []} cols={fields || []} />,
        'listUsers': () => <ListUsers rows={values || []} cols={fields || []} />,
        "dashboard": () => <DashboardEditor />,
        "login": () => <LoginUsers />,
        "logout": () => <LogoutUsers />,
        'notFound': () => <Notfound />
    };

    return viewComponents.hasOwnProperty(renderType)
        ? viewComponents[renderType]()
        : <Loading />
}

/**
 * Build requested view from API data.
 *
 * @param {String} route
 * @public
 */

const Static = ({type}) => {
    return (
        <>
            { renderView({renderType: type}) }
        </>
    );
}

/**
 * Build requested view from API data.
 *
 * @param {String} route
 * @public
 */

const Data = ({ route}) => {

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
    const { view='', model={}, attributes={} } = schema || {};
    const { label='View' } = attributes || {};

    return (
        <div className={'view'}>
            <BreadcrumbMenu />
            <MenuEditor model={model} view={view} />
            <Heading model={model} text={label} />
            {renderView({ route, renderType, schema, values, callback })}
        </div>
    );

}

/**
 * View component.
 *
 * @param {String} route
 * @public
 */

const View = ({route}) => {
    const staticType = getStaticView(route);

    // render static / non-static view
    return staticType
        ? <Static type={staticType} />
        : <Data route={route} />;
}

/**
 * Render editor panel component (authenticated).
 *
 * @public
 */

const Editor = () => {
    const route = getPath();

    return (
        <div className={'editor'}>
            <Messenger />
            <View route={route} />
        </div>
    )
};

export default Editor;
