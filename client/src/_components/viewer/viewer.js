/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Form from '../common/form';
import Notfound from '../error/notfound';
import { getSchema, getStaticView, getViewType } from '../../_services/schema.services.client';
import { getPath, redirect } from '../../_utils/paths.utils.client';
import DashboardViewer from './dashboard.viewer';
import List from '../common/list';
import LoginUser from '../user/login.user';
import { useData } from '../../_providers/data.provider.client';
import LogoutUser from '../user/logout.user';
import Loading from '../common/loading';

/**
 * Render non-static view component.
 *
 * @public
 * @param { route, viewType, viewData, callback }
 * @return {React.Component}
 */

const renderView = ({ route, viewType, viewData, callback }) => {
    const viewComponents = {
        'empty': () => <Loading />,
        'form': () => <Form route={route} props={viewData} callback={callback} />,
        'item': () => <div>Item View</div>,
        'list': () => <List items={viewData} />,
        "dashboard": () => <DashboardViewer />,
        "login": () => <LoginUser />,
        "logout": () => <LogoutUser />,
        'notFound': () => <Notfound />
    };

    return viewComponents.hasOwnProperty(viewType)
        ? viewComponents[viewType]()
        : <Notfound />
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

const Data = ({route}) => {

    // create dynamic view state
    const [viewData, setView] = React.useState({});
    const [viewType, setViewType] = React.useState('');

    const api = useData();

    // Get global data from API
    React.useEffect(() => {

        // non-static views: fetch API data and set view data in state
        api.get(route)
            .then(res => {
                console.log('API Response:', res)
                const { view, model, data } = res;
                // lookup view in schema
                setView({
                    schema: getSchema(view, model),
                    data: data,
                    model: model
                });
                setViewType(getViewType(view));
            })
    }, [route, setView, setViewType, viewType]);

    // select default callback for view
    const callback = api.post;

    return (
        <div className={'view'}>
            { renderView({ route, viewType, viewData, callback }) }
        </div>
    );
}


/**
 * Build viewer panel.
 *
 * @public
 */

const Viewer = () => {

    const route = getPath();
    const staticType = getStaticView(route);

    return (
        <div className={"viewer"}>
            { staticType ? <Static type={staticType} /> : <Data route={route} /> }
        </div>
    )
};

export default Viewer;
