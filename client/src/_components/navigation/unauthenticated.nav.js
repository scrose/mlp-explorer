/*!
 * MLP.Client.Components.Navigation.Unauthenticated
 * File: unauthenticated.nav.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { redirect } from '../../_utils/paths.utils.client';
import Icon from '../common/icon';


/**
 * User navigation menu (unauthenticated).
 *
 * @public
 */

const UnauthenticatedNav = () => {
    return (
        <nav className={'user'}>
            <div className={'menu'}>
                <div>
                    <button onClick={() => redirect("/login")}>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default UnauthenticatedNav;
