/*!
 * MLP.Client.Components.Menu.Viewer
 * File: main.nav.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getNodeURI, reroute } from '../../_utils/paths.utils.client';
import Icon from '../common/icon';

/**
 * Viewer menu component.
 *
 * @public
 */

const MenuViewer = ({model, id=null, view}) => {
    const menuExclude = ['dashboard', 'login', 'register']
    return (
        view && !menuExclude.includes(view) ?
            <div className={'editor-tools h-menu'}>
                {''}
            </div>
            : ''
    )
}

export default MenuViewer;

