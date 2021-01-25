/*!
 * MLP.Client.Components.Common.View.Data
 * File: data.view.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import DashboardViewer from '../viewer/dashboard.viewer';
import DashboardEditor from '../editor/dashboard.editor';
import LoginUsers from '../users/login.users';
import LogoutUsers from '../users/logout.users';
import Notfound from '../error/notfound';
import Heading from '../common/heading';

/**
 * Build requested static page view.
 *
 * @param {String} type
 * @public
 */

const StaticView = ({ type }) => {

    // view components indexed by render type
    const renders = {
        "dashboardView": () => <DashboardViewer />,
        "dashboardEdit": () => <DashboardEditor />,
        "login": () => <LoginUsers />,
        "logout": () => <LogoutUsers />,
        'notFound': () => <Notfound />
    }

    // render static view
    return renders.hasOwnProperty(type) ? renders[type]() : <Notfound/>

}

export default StaticView;
