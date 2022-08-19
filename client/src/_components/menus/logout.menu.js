/*!
 * MLP.Client.Components.Navigation.Logout
 * File: login.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import { useUser } from '../../_providers/user.provider.client';
import { useAuth } from '../../_providers/auth.provider.client';
import {redirect} from "../../_utils/paths.utils.client";
import Accordion from "../common/accordion";
import Button from "../common/button";
import Loading from "../common/loading";
import {useNav} from "../../_providers/nav.provider.client";

/**
 * User navigation menu (authenticated).
 *
 * @public
 */

const LogoutMenu = () => {
    const user = useUser();
    const auth = useAuth();
    const nav = useNav();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    return (
        <nav className={'main'}>
            { isLoggingOut && <Loading overlay={true} /> }
            <Accordion type={'user'} label={ !nav.offCanvas ? user.email : ''}>
                <ul className={'user-menu'}>
                        <li><b>{user.email} ({user.label})</b></li>
                        <li><Button
                            className={'submit'}
                            icon={'logout'}
                            label={'Sign Out'}
                            onClick={() => {
                                setIsLoggingOut(true);
                                auth.logout().then(() => {
                                    setIsLoggingOut(false);
                                    redirect('/')
                                })
                            }}
                        /></li>
                </ul>
            </Accordion>
        </nav>
    );
};

export default React.memo(LogoutMenu);
