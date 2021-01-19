/*!
 * MLP.Client.Components.Editor
 * File: editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Form from '../common/form';
import Notfound from '../error/notfound';
import { getSchema, getStaticView, getRenderType } from '../../_services/schema.services.client';
import LoginUser from '../user/login.user';
import LogoutUser from '../user/logout.user';
import { getPath } from '../../_utils/paths.utils.client';
import DashboardEditor from './dashboard.editor';
import List from '../common/list';
import { useData } from '../../_providers/data.provider.client';
import Loading from '../common/loading';
import Table from '../common/table';

/**
 * Render non-static view component.
 *
 * @public
 * @param { route, viewType, viewData, callback }
 * @return {React.Component}
 */

const renderView = ({ route, viewType, schemaData, apiData, callback }) => {
    // extract data
    const viewComponents = {
        'form': () => <Form route={route} schema={schemaData} callback={callback} />,
        'item': () => <div>Item View</div>,
        'list': () => <Table rows={apiData} cols={schemaData} />,
        "dashboard": () => <DashboardEditor />,
        "login": () => <LoginUser />,
        "logout": () => <LogoutUser />,
        'notFound': () => <Notfound />
    };

    return viewComponents.hasOwnProperty(viewType)
        ? viewComponents[viewType]()
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
            { renderView({viewType: type}) }
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
    const [schemaData, setSchema] = React.useState(null);
    const [apiData, setAPIData] = React.useState(null);
    const [viewType, setViewType] = React.useState('');
    const api = useData();

    // non-static views: fetch API data and set view data in state
    React.useEffect(() => {
        api.get(route)
            .then(res => {
                // lookup view in schema
                const { view = '', model = {}, data = {} } = res || {};
                const { name = '', attributes = {} } = model;

                setViewType(getRenderType(view));

                console.log('API Response:', res);
                console.log('API Data:', data)

                setSchema(getSchema(view, name, attributes));
                console.log('Schema:', getSchema(view, name, attributes))
                setAPIData(data);


            });
    }, [api, route, setSchema, setAPIData, setViewType, viewType]);

    // select default callback for view
    const callback = api.post;

    return (
        <div className={'view'}>
            {renderView({ route, viewType, schemaData, apiData, callback })}
        </div>
    );

}

/**
 * Render editor panel component (authenticated).
 *
 * @public
 */

const Editor = () => {
    const route = getPath();
    const staticType = getStaticView(route);
    return (
        <div className={'editor'}>
            { staticType ? <Static type={staticType} /> : <Data route={route} /> }
        </div>
    )
};

export default Editor;
