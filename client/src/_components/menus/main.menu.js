/*!
 * MLP.Client.Components.Navigation.Main
 * File: main.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../_utils/paths.utils.client';
import {getInfo} from "../../_services/schema.services.client";
import Accordion from "../common/accordion";
import {useNav} from "../../_providers/nav.provider.client";

const MenuItems = () => {
    const rootURL = getRoot();
    return <ul>
        <li><a href={rootURL}>Dashboard</a></li>
        <li><a rel={"noreferrer"} target={'_blank'} href={getInfo().mlp_url}>MLP Website</a></li>
        <li><a href={'/iat'}>Image Toolkit</a></li>
        <li><a href={"mailto:mntnlgcy@uvic.ca"}>Contact</a></li>
    </ul>
}

/**
 * Component for main navigation menu.
 *
 * @public
 */

const MainMenu = () => {
    const nav = useNav();
    return nav.offCanvas
        ? <nav className={'main'}>
            <Accordion label={'Menu'}>
                <div style={{padding: '5px'}} className={'v-menu'}>
                    <MenuItems />
                </div>
            </Accordion>
        </nav>
        : <nav className={'main'}><MenuItems /></nav>;
}
export default MainMenu;
