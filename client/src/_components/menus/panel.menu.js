/*!
 * MLP.Client.Components.Navigation.Panel
 * File: panel.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MenuNavigator from "./navigator.menu";
import ViewerMenu from "./viewer.menu";
import EditorMenu from "./editor.menu";
import {getDependentTypes} from "../../_services/schema.services.client";
import {useData} from "../../_providers/data.provider.client";
import {useUser} from "../../_providers/user.provider.client";
import {useNav} from "../../_providers/nav.provider.client";

/**
 * Panel menu component.
 *
 * @public
 */

const PanelMenu = () => {

    const user = useUser();
    const api = useData();
    const nav = useNav();

    // get current file data (if available)
    const { file={} } = api.data || {};
    const { id='', filename='', file_type={} } = file || {};

    return <div className={'panel-menu h-menu'}>
        <ul>
            <li>
                <MenuNavigator/>
            </li>
            <li className={'push'}>
            {
                user ?
                    <EditorMenu
                        className={'editor-tools'}
                        model={api.model}
                        view={api.view}
                        id={api.id}
                        label={api.label}
                        owner={api.owner}
                        metadata={api.metadata}
                        fileType={api.type}
                        filename={filename}
                        compact={nav.offCanvas}
                        dependents={getDependentTypes(api.model)}
                    />
                    : <ViewerMenu
                        id={id}
                        filename={filename}
                        fileType={file_type}
                        compact={nav.offCanvas}
                    />
            }
            </li>
        </ul>
    </div>
};

export default PanelMenu;

