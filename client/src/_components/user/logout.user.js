/*!
 * MLP.Client.Components.User.Logout
 * File: logout.user.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import { useAuth } from '../../_providers/auth.provider.client';
import { redirect } from '../../_utils/paths.utils.client';
import Loading from '../common/loading';
import { useUser } from '../../_providers/user.provider.client';
import { addMsg } from '../../_services/session.services.client';

const LogoutUser = () => {

    const auth = useAuth();
    const user = useUser();

    // Delete session data and redirect
    React.useEffect(() => {
        if (user) {
            auth.logout();
        }
        else {
            addMsg({msg:'User is logged out.', type:'info'})
        }
        return redirect('/');
    }, []);

    return <Loading />;
}

export default LogoutUser;
