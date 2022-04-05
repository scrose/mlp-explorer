/*!
 * MLP.Client.Components.Navigation.Login
 * File: login.menu.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import { useUser } from '../../_providers/user.provider.client';
import { useAuth } from '../../_providers/auth.provider.client';
import { genSchema } from '../../_services/schema.services.client';
import { UserMessage } from '../common/message';
import {useRouter} from "../../_providers/router.provider.client";
import {redirect} from "../../_utils/paths.utils.client";
import Loading from "../common/loading";
import Accordion from "../common/accordion";
import {useNav} from "../../_providers/nav.provider.client";

/**
 * User sign-in form component.
 *
 * @public
 */

const LoginMenu = ( toggle=false ) => {

    const user = useUser();
    const auth = useAuth();
    const nav = useNav();
    const schema = genSchema({ view:'login', model:'users'});
    const [message, setMessage] = React.useState(null);
    const [isLoggingIn, setIsLoggingIn] = React.useState(false);
    const router = useRouter();

    // login callback
    const _callback = async (route, credentials) => {
        setIsLoggingIn(true);
        auth.login(route, credentials).then(msg => {
            setIsLoggingIn(false);
            if (msg) setMessage(msg);
            else redirect(router.route);
        });
    }

    return <>
        { isLoggingIn && <Loading overlay={true} /> }
        { user
            ? <div>User {user.email} is signed in.</div>
            :
            <nav className={'main'}>
                <Accordion type={'user'} label={!nav.offCanvas ? 'Sign In' : ''}>
                    <div className={'user-menu'}>
                        <UserMessage
                            message={message}
                            closeable={false}
                        />
                        <Form
                            model={'users'}
                            schema={schema}
                            callback={_callback}
                            route={'/login'}
                        />
                    </div>
                </Accordion>
            </nav>
            }
        </>
}

export default React.memo(LoginMenu);
