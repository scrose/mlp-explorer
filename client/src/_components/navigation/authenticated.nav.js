/*!
 * MLP.Client.Components.Navigation.Authenticated
 * File: authenticated.nav.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { redirect } from '../../_utils/paths.utils.client';
import { useUser } from '../../_providers/user.provider.client';

/**
 * User navigation menu (authenticated).
 *
 * @public
 */

const AuthenticatedNav = () => {
    const user = useUser();
    return (
        <nav className={'user'}>
            <dl>
                <dt>
                    <button onClick={() => redirect("/logout")}>
                        <span>Logout</span>
                    </button>
                </dt>
                <dt>User</dt>
                <dd><a href={`/profile`}>{user.email}</a></dd>
                <dt>Role</dt>
                <dd>{user.label}</dd>
            </dl>
        </nav>
    );
}

export default AuthenticatedNav;

