/*!
 * MLP.Client.Components.Navigation.Authenticated
 * File: authenticated.nav.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { redirect } from '../../_utils/paths.utils.client';
import { useUser } from '../../_providers/user.provider.client';
import Icon from '../common/icon';

/**
 * User navigation menu (authenticated).
 *
 * @public
 */

const AuthenticatedNav = () => {
    const user = useUser();
    return (
        <nav className={'user'}>
            <div className={'menu'}>
                <div className={'icon'} >
                    <a href={`/profile`} title={'View user profile.'}>
                        <Icon type={'user'} />
                    </a>
                </div>
                <div className={'info'}>
                    <p><a href={`/profile`} title={'View user profile.'}>{user.email}</a></p>
                    <p title={'User Role'}>{user.label}</p>
                </div>
                <div>
                    <button title={'Logout of session.'} onClick={() => redirect("/logout")}>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default AuthenticatedNav;

