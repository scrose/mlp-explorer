/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Message from '../common/message';
import DataView from '../views/data.view';
import StaticView from '../views/static.view';
import { useRouter } from '../../_providers/router.provider.client';
import Heading from '../common/heading';
import MenuViewer from './menu.viewer';
import { getNavView } from '../../_services/session.services.client';
import HelpView from '../views/help.view';

/**
 * Render viewer panel component (unauthenticated).
 *
 * @public
 */

const Viewer = () => {

    // get router context provider
    const router = useRouter();

    return (
        <div className={'viewer'}>
            <MenuViewer />
            <div className={`view ${getNavView()}`}>
                <Heading />
                <Message />
                {
                    router.staticView
                    ? <StaticView type={
                        router.staticView === 'dashboard'
                            ? 'dashboardView'
                            : router.staticView
                    } />
                    : <DataView />
                }
            </div>
        </div>
    )
};

export default React.memo(Viewer);
