/*!
 * MLP.Client.Components.Viewer.Header
 * File: header.viewer.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MainMenu from './main.menu';
import Logo from '../common/logo';
import Accordion from "../common/accordion";
import LoginUsers from "../users/login.users";

/**
 * Page header component (unauthenticated).
 *
 * @public
 */

const HeadViewerMenu = () => {
    return (
        <header>
            <div className={'banner'}>
                <div className={'navbar h-menu'}>
                    <ul>
                        <li><Logo /></li>
                        <li><MainMenu /></li>
                        <li className={'push'}>
                            <nav className={'user'}>
                                <Accordion label={'Sign In'}>
                                    <LoginUsers />
                                </Accordion>
                            </nav>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}

export default React.memo(HeadViewerMenu);
