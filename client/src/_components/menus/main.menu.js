/*!
 * MLP.Client.Components.Menus.Main
 * File: main.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../_utils/paths.utils.client';

/**
 * Breadcrumb navigation menu component.
 *
 * @public
 */

const MainMenu = () => {
    const rootURL = getRoot();
    return (
        <nav className={'main'}>
            <div>
                <ul>
                    <li><a href={rootURL}>Home</a></li>
                    <li><a href={rootURL}>About</a></li>
                    <li><a href={rootURL}>Tools</a></li>
                    <li><a href={rootURL}>MLP</a></li>
                    <li><a href={rootURL}>Help</a></li>
                </ul>
            </div>
        </nav>
    )
}

export default MainMenu;
