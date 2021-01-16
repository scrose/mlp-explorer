/*!
 * MLP.Client.Components.Navigation.Main
 * File: main.nav.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Icon from '../common/icon';
import { getPath, getRoot } from '../../_utils/paths.utils.client';
import List from '../common/list';


/**
 * Breadcrumb navigation menu component.
 *
 * @public
 */

const MainNav = ({user}) => {
    const rootURL = getRoot();
    return (
        <nav className={'main'}>
            <ul>
                <li><a href={rootURL}>Home</a></li>
                <li><a href={rootURL}>About</a></li>
                <li><a href={rootURL}>User Guide</a></li>
                <li><a href={rootURL}>Tools</a></li>
                <li><a href={rootURL}>MLP Website</a></li>
                <li><a href={rootURL}>Help</a></li>
            </ul>
        </nav>
    )
}

export default MainNav;
