/*!
 * MLP.Client.Components.Editor
 * File: editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import DataView from '../views/data.view';
import Messenger from '../common/messenger';
import StaticView from '../views/static.view';
import { useRouter } from '../../_providers/router.provider.client';
import Heading from '../common/heading';
import MenuEditor from './menu.editor';

/**
 * Render editor panel component (authenticated).
 *
 * @public
 */

const Editor = () => {

    // get router context provider
    const router = useRouter();

    return (
        <div className={'editor'}>
            <MenuEditor />
            <Heading />
            <Messenger />
            {
                router.staticView
                    ? <StaticView type={
                        router.staticView === 'dashboard'
                            ? 'dashboardEdit'
                            : router.staticView
                    } />
                    : <DataView />
            }
        </div>
    )
};

export default React.memo(Editor);