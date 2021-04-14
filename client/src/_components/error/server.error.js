/*!
 * MLP.Client.Components.Error.Server
 * File: server.error.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";

const ServerError = () => {
    return (
        <div className={'error'}>
            <h3>Server Error</h3>
            <p>An error has occurred. <em>Please contact the site administrator for assistance.</em></p>
        </div>
    );
}

export default ServerError;
