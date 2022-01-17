/*!
 * MLP.Client.Components.Navigation.Banner
 * File: banner.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import MainMenu from './main.menu';
import Logo from '../common/logo';
import LogoutMenu from "./logout.menu";
import LoginMenu from "./login.menu";
import {useUser} from "../../_providers/user.provider.client";

/**
 * Main navigation bar.
 *
 * @public
 */

const BannerMenu = () => {
    const user = useUser();
    return (
        <header>
            <div className={'banner'}>
                <div className={'navbar h-menu'}>
                    <ul>
                        <li><Logo /></li>
                        <li><MainMenu /></li>
                        <li className={'push'}>
                            { user ? <LogoutMenu /> : <LoginMenu /> }
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default BannerMenu;
