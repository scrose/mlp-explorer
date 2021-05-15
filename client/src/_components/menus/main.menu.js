/*!
 * MLP.Client.Components.Menus.Main
 * File: main.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../_utils/paths.utils.client';
import HelpView from '../views/help.view';
import Button from '../common/button';

/**
 * Component for main navigation menu.
 *
 * @public
 */

const MainMenu = () => {

    // get client root url
    const rootURL = getRoot();

    return <nav className={'main'}>
            <div className={'h-menu'}>
                <ul>
                    <li><a href={rootURL}>Dashboard</a></li>
                    <li><a href={'http://mountainlegacy.ca'}>About MLP</a></li>
                    <li><a href={'/iat'}>IA Toolkit</a></li>
                </ul>
            </div>
        </nav>
}
export default MainMenu;
