/*!
 * MLP.Client.Components.Common.View
 * File: view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Form from './form';
import Item from './item';
import Table from './table';
import ListUsers from '../users/list.users';
import DashboardEditor from '../editor/dashboard.editor';
import LoginUsers from '../users/login.users';
import LogoutUsers from '../users/logout.users';
import Notfound from '../error/notfound';
import Loading from './loading';
import DashboardViewer from '../viewer/dashboard.viewer';
import ListNodes from '../nodes/list.nodes';


/**
 * Render view component.
 *
 * @public
 * @return {React.Component}
 */

const View = ({route, type, schema, data, callback}) => {
    console.log('View schema:', schema)

    // destructure data fields from schema (Optional)
    const { fields = [] } = schema || {};

    // view components indexed by render type
    const views = {
        'form': () => <Form route={route} schema={schema} callback={callback} />,
        'item': () => <Item values={data || {}} fields={fields || []} />,
        'list': () => <Table rows={data || []} cols={fields || []} />,
        'listUsers': () => <ListUsers rows={data || []} cols={fields || []} />,
        'listNodes': () => <ListNodes rows={data || []} cols={fields || []} />,
        "dashboardView": () => <DashboardViewer />,
        "dashboardEdit": () => <DashboardEditor />,
        "login": () => <LoginUsers />,
        "logout": () => <LogoutUsers />,
        'notFound': () => <Notfound />
    }

    // render view component
    return (
        <div className={'view'}>
            {
                views.hasOwnProperty(type) ? views[type]() : <Loading/>
            }
        </div>
    )
}

export default View;
