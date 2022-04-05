/*!
 * MLP.Client.Components.Error.Access
 * File: access.error.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from "react";

const AccessError = () => {
    return (
        <div className={'msg error'}>
            <h3>Access Denied</h3>
            <p>This page is only accessible to authenticated users.</p>
            <p>Return to the <a href={"/"}>Homepage</a>.</p>
        </div>
    );
}

export default AccessError;
