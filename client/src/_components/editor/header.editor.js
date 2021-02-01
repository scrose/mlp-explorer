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
import Icon from '../common/icon';
import { redirect, reroute } from '../../_utils/paths.utils.client';
import { getEmailUser } from '../../_utils/data.utils.client';

/**
 * User navigation menu (authenticated).
 *
 * @public
 */

const UserMenu = () => {
    const user = useUser();
    return (
        <nav className={'user'}>
            <div>
                <ul>
                    <li>
                        <a href={`/profile`} title={'View user profile.'}>
                            <Icon type={'user'} /> {getEmailUser(user.email)} {user.label}
                        </a>
                    </li>
                    <li>
                        <button title={'Sign out of session.'} onClick={() => redirect("/logout")}>
                            <span>Sign Out</span>
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

/**
 * Page header component.
 *
 * @public
 */

const HeaderEditor = () => {
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

export default HeaderEditor;
