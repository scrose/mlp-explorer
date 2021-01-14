/*!
 * MLP.Client.Components.User.Logout
 * File: logout.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import { removeSession } from '../../services/session.services.client';
import { useAuth } from '../../context/auth.context.client';
import { getPath, getURL } from '../../services/api.services.client';

const Logout = () => {

    const auth = useAuth();

    // Delete session data
    React.useEffect(() => { auth.logout() }, []);

    return (
        <div>
            <p>Would you like to <a href={getURL('/login')}>Sign In</a> again?</p>
        </div>
    );
}

export default Logout;
