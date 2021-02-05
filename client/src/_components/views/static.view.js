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
import NotfoundError from '../error/notfound.error';
import UnavailableError from '../error/unavailable.error';
import ServerError from '../error/server.error';

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
        'notFound': () => <NotfoundError />,
        'serverError': () => <ServerError />,
        'unavailable': () => <UnavailableError />
    }

    // render static view
    return (
        <div className={'view'}>
            { renders.hasOwnProperty(type) ? renders[type]() : <NotfoundError/> }
        </div>
        )

}

export default StaticView;
