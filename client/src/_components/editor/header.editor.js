/*!
 * MLP.Client.Components.Editor.Header
 * File: header.editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MainMenu from '../menus/main.menu';
import Logo from '../common/logo';
import { useUser } from '../../_providers/user.provider.client';
import { redirect } from '../../_utils/paths.utils.client';
import BreadcrumbMenu from '../menus/breadcrumb.menu';
import Accordion from '../common/accordion';
import Button from '../common/button';
import Table from '../common/table';

/**
 * User navigation menu (authenticated).
 *
 * @public
 */

const UserMenu = () => {
    const user = useUser();
    return (
        <nav className={'user'}>
            <Accordion type={'user'}>
                <div>
                    <div><b>{user.email}</b></div>
                    <div>{user.label}</div>
                    <div className={'centred'}><Button
                        icon={'logout'}
                        label={'Sign Out'}
                        onClick={() => redirect('/logout')}
                    /></div>
                </div>
            </Accordion>
        </nav>
    );
};

/**
 * Page header component.
 *
 * @public
 */

const HeaderEditor = () => {
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
};

export default HeaderEditor;
