/*!
 * MLP.Client.Components.Common.View.Static
 * File: static.view.js
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
import Loading from '../common/loading';

/**
 * Build requested static page view.
 *
 * @param {String} type
 * @public
 */

const StaticView = ({ type }) => {

    // view components indexed by render type
    const renders = {
        dashboardView: () => <DashboardViewer />,
        dashboardEdit: () => <DashboardEditor />,
        login: () => <LoginUsers />,
        logout: () => <LogoutUsers />,
        notFound: () => <NotfoundError />,
        serverError: () => <ServerError />,
        unavailable: () => <UnavailableError />,
        default: () => <Loading />
    }

    // render static view
    return (
        <div className={'view'}>
            { renders.hasOwnProperty(type) ? renders[type]() : <Loading/> }
        </div>
        )

}

export default StaticView;
