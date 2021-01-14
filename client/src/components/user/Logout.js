/*!
 * MLP.Client.Components.User.Logout
 * File: Logout.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import { removeSession } from '../../services/session.services.client';

const Logout = () => {

    // Delete session data
    React.useEffect(() => { removeSession() }, []);

    return (
        <div>
            <p>User has logged out.</p>
        </div>
    );
}

export default Logout;
