/*!
 * MLP.Client.Components.Editor.Header
 * File: header.editor.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MainMenu from './main.menu';
import Logo from '../common/logo';
import { useUser } from '../../_providers/user.provider.client';
import { redirect } from '../../_utils/paths.utils.client';
import BreadcrumbMenu from './breadcrumb.menu';
import Accordion from '../common/accordion';
import Button from '../common/button';
import {useAuth} from "../../_providers/auth.provider.client";
import {useRouter} from "../../_providers/router.provider.client";

/**
 * User navigation menu (authenticated).
 *
 * @public
 */

const UserMenu = () => {
    const user = useUser();
    const auth = useAuth();
    return (
        <nav className={'user'}>
            <Accordion type={'user'}>
                <div className={'login'}>
                    <p className={'centred'}><b>{user.email}</b></p>
                    <p className={'centred'}>{user.label}</p>
                    <div className={'centred'}><Button
                        icon={'logout'}
                        label={'Sign Out'}
                        onClick={() => auth.logout().then(() => {redirect('/')})}
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

const HeadEditorMenu = () => {
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

export default HeadEditorMenu;
