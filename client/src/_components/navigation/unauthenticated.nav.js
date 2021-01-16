/*!
 * MLP.Client.Components.Navigation.Unauthenticated
 * File: unauthenticated.nav.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { redirect } from '../../_utils/paths.utils.client';


/**
 * User navigation menu (unauthenticated).
 *
 * @public
 */

const UnauthenticatedNav = () => {
    return (
        <nav className={'user'}>
            <ul>
                <li>
                    <button onClick={() => redirect("/login")}>
                        <span>Login</span>
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default UnauthenticatedNav;
