/*!
 * MLP.Client.Components.Viewer.Header
 * File: header.viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MainMenu from '../menus/main.menu';
import Logo from '../common/logo';
import { redirect } from '../../_utils/paths.utils.client';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import Button from '../common/button';
import Accordion from "../common/accordion";
import LoginUsers from "../users/login.users";

/**
 * User navigation menu (unauthenticated).
 *
 * @public
 */

const UserMenu = () => {
    return (
    <nav className={'user'}>
        <Accordion
            label={'Sign In'}
        >
            <LoginUsers />
        </Accordion>
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
            <div className={'banner'}>
                <div className={'navbar h-menu'}>
                    <ul>
                        <li><Logo /></li>
                        <li><MainMenu /></li>
                        <li className={'push'}><UserMenu /></li>
                    </ul>
                </div>
                <div className={'context-menu'}>
                    <BreadcrumbMenu />
                </div>
            </div>
        </header>
    );
}

export default React.memo(HeaderViewer);
