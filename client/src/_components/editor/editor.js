/*!
 * MLP.Client.Components.Editor
 * File: editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getStaticRenderType } from '../../_services/schema.services.client';
import { getPath } from '../../_utils/paths.utils.client';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import DataView from '../views/data.view';
import Messenger from '../common/messenger';
import StaticView from '../views/static.view';
import ViewerMenu from '../menus/viewer.menu';
import EditorMenu from '../menus/editor.menu';

/**
 * Render editor panel component (authenticated).
 *
 * @public
 */

const Editor = () => {
    const route = getPath();

    // Lookup static view in schema
    const staticRenderType = getStaticRenderType(route) === 'dashboard'
        ? 'dashboardEdit'
        : getStaticRenderType(route);

    return (
        <div className={'editor'}>
            <div className={'header'}>
                <BreadcrumbMenu />
                <Messenger />
                <EditorMenu />
            </div>
            {
                staticRenderType
                    ? <StaticView type={staticRenderType} />
                    : <DataView route={route} />
            }
        </div>
    )
};

export default Editor;
