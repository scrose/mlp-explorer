/*!
 * MLP.Client.Components.User.Logout
 * File: logout.user.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import { useAuth } from '../../_providers/auth.provider.client';
import { useUser } from '../../_providers/user.provider.client';
import Loading from '../common/loading';
import { useMessenger } from '../../_providers/messenger.provider.client';
import { redirect } from '../../_utils/paths.utils.client';

const LogoutUsers = () => {

    const auth = useAuth();
    const user = useUser();
    const msg = useMessenger();

    // Delete session data and redirect
    React.useEffect(() => {
        if (user) {
            auth.logout()
                .then(res => {
                    const { message='' } = res || {}
                    msg.setMessage(message);
                    redirect('/')
                });
        }
        return () => {};
    }, [auth, user, msg]);

    return user
        ?   <div>
                <p>Logging out...</p>
                <Loading/>
            </div>
        : <div><p>User is signed out.</p></div>
}

export default LogoutUsers;
