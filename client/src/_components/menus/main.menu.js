/*!
 * MLP.Client.Components.Menus.Main
 * File: main.menu.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../_utils/paths.utils.client';
import {getInfo} from "../../_services/schema.services.client";

/**
 * Component for main navigation menu.
 *
 * @public
 */

const MainMenu = () => {

    // get client root url
    const rootURL = getRoot();

    return <nav className={'main'}>
            <div className={'h-menu'}>
                <ul>
                    <li><a href={rootURL}>Dashboard</a></li>
                    <li><a rel={"noreferrer"} target={'_blank'} href={getInfo().mlp_url}>MLP Website</a></li>
                    <li><a href={'/iat'}>Image Toolkit</a></li>
                </ul>
            </div>
        </nav>
}
export default MainMenu;
