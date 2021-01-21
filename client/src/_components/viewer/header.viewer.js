/*!
 * MLP.Client.Components.Viewer.Header
 * File: header.viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import MainMenu from '../menus/main.menu';
import Logo from '../common/logo';
import { redirect } from '../../_utils/paths.utils.client';

/**
 * User navigation menu (unauthenticated).
 *
 * @public
 */

const UserMenu = () => {
    return (
        <nav className={'user'}>
            <div>
                <ul>
                    <li>
                        <button onClick={() => redirect("/login")}>
                            <span>Login</span>
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

/**
 * Page header component (unauthenticated).
 *
 * @public
 */

const HeaderViewer = () => {
    return (
        <header>
            <div className={'navbar'}>
                <Logo />
                <MainMenu />
                <UserMenu />
            </div>
        </header>
    );
}

export default HeaderViewer;
