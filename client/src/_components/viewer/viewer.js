/*!
 * MLP.Client.Components.Viewer
 * File: viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Messenger from '../common/messenger';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import MenuViewer from './menu.viewer';
import DataView from '../views/data.view';
import StaticView from '../views/static.view';
import { useRouter } from '../../_providers/router.provider.client';
import Heading from '../common/heading';
import { useData } from '../../_providers/data.provider.client';

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
            <Heading />
            <Messenger />
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
    )
};

export default React.memo(Viewer);
