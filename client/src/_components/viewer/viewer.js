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
import { useData } from '../../_providers/data.provider.client';

/**
 * Render viewer panel component (unauthenticated).
 *
 * @public
 */

const Viewer = () => {

    // get router context providers
    const router = useRouter();
    const api = useData();
    const { file={} } = api.data || {};
    const { id='', filename='', file_type={} } = file || {};

    return (
        <div className={'viewer'}>
            <MenuViewer
                id={id}
                filename={filename}
                fileType={file_type}
                compact={false}
            />
            <div className={`view`}>
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
