/*!
 * MLP.Client.Components.Common.Authenticated
 * File: app.authenticated.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import Header from './header';
import Navigator from './navigator';
import ErrorBoundary from '../error/ErrorBoundary';
import Viewer from './viewer';
import Footer from './footer';
import React from 'react';

/**
 * Main app component for unauthenticated users.
 *
 * @public
 */

const Authenticated = () => {
    return (
        <div className={"page-content"}>
            <Header />
            <main>
                <Navigator/>
                <ErrorBoundary>
                    <Viewer/>
                </ErrorBoundary>
            </main>
            <Footer/>
        </div>
    );
}

export default Authenticated;
