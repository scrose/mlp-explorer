/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Form from '../common/form';
import * as api from '../../_services/api.services.client';
import { postData } from '../../_services/api.services.client';
import Notfound from '../error/notfound';
import { getMessage, getSchema, getStaticView, getViewType } from '../../_services/schema.services.client';
import { useMsg } from '../../_providers/msg.provider.client';
import { getPath, getQuery } from '../../_utils/paths.utils.client';
import DashboardViewer from './dashboard.viewer';
import List from '../common/list';
import Messenger from '../common/messenger';
import LoginUser from '../user/login.user';

/**
 * Render non-static view component.
 *
 * @public
 * @param { route, viewType, viewData, callback }
 * @return {React.Component}
 */

const renderView = ({ route, viewType, viewData, callback=postData }) => {
    const viewComponents = {
        'empty': () =>      <div className={'empty'} />,
        'form': () =>       <Form route={route} props={viewData} callback={callback} />,
        'item': () =>       <div>Item View</div>,
        'list': () =>       <List items={viewData} />,
        "dashboard": () =>  <DashboardViewer />,
        "login": () => <LoginUser />,
        'notFound': () =>   <Notfound />
    };

    return viewComponents.hasOwnProperty(viewType)
        ? viewComponents[viewType]()
        : <div className={'waiting'}>Loading Viewer...</div>
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
    const messenger = useMsg();

    // Get global data from API
    React.useEffect(() => {

        // non-static views: fetch API data and set view data in state
        api.getData(route)
            .then(res => {
                console.log('API Response:', res)
                const { view, model, data, message } = res;

                // lookup view in schema
                setView({
                    schema: getSchema(view, model),
                    data: data,
                    model: model
                });
                setViewType(getViewType(view));

                // post message
                messenger.setMessage(message);

            })
    }, [route, setView, setViewType, viewType, messenger]);

    // select default callback for view
    const callback = postData;

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
            <Messenger />
            { staticType ? <Static type={staticType} /> : <Data route={route} /> }
        </div>
    )
};

export default Viewer;
