/*!
 * MLP.Client.Components.Common.View
 * File: view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Form from './form';
import Item from './item';
import HorzTable from './horz.table';
import ListUsers from '../users/list.users';
import DashboardEditor from '../editor/dashboard.editor';
import LoginUsers from '../users/login.users';
import LogoutUsers from '../users/logout.users';
import Notfound from '../error/notfound';
import Loading from './loading';
import DashboardViewer from '../viewer/dashboard.viewer';
import Heading from './heading';


/**
 * Render view component.
 *
 * @public
 * @return {React.Component}
 */

const View = ({route, type, schema, data, callback}) => {
    console.log('View schema:', schema)

    // get view, model settings from schema
    const { view='', model={}, attributes={} } = schema || {};
    const { label='' } = attributes || {};

    // destructure data fields from schema (Optional)
    const { fields = [] } = schema || {};

    // view components indexed by render type
    const views = {
        'form': () => <Form route={route} schema={schema} callback={callback} />,
        'item': () => <Item values={data || {}} fields={fields || []} />,
        'list': () => <HorzTable rows={data || []} cols={fields || []} />,
        'listUsers': () => <ListUsers rows={data || []} cols={fields || []} />,
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
                model && label ? <Heading model={model} text={label}/> : ''
            }
            {
                views.hasOwnProperty(type) ? views[type]() : <Loading/>
            }
        </div>
    )
}

export default View;
