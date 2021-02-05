/*!
 * MLP.Client.Components.Error.Unavailable
 * File: unavailable.error.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";

const UnavailableError = () => {

    return (
        <div className="page-content">
            <main>
                <div className={'maintenance'}>
                    <h2>Explorer is currently unavailable</h2>
                    <p>Sorry, this application is currently undergoing maintenance
                        and is not available. Please check back soon for updates.</p>
                </div>
            </main>
        </div>

    );
}

export default UnavailableError;
