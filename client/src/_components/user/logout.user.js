/*!
 * MLP.Client.Components.User.Logout
 * File: logout.user.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import { getSessionToken, removeSession } from '../../_services/session.services.client';
import { useAuth } from '../../_providers/auth.provider.client';
import { getURL, redirect } from '../../_utils/paths.utils.client';
import Form from '../common/form';
import { useUser } from '../../_providers/user.provider.client';

const LogoutUser = () => {

    const user = useUser();
    const auth = useAuth();

    // Delete session data and redirect
    React.useEffect(() => {
        // check for session token
        const redirectURL = getSessionToken()
            ? '/login?logout=true'
            : '/login';
        auth.logout();
        redirect(redirectURL);
    }, []);

    return <div><p>User is logged out. Redirecting...</p></div>;
}

export default LogoutUser;
