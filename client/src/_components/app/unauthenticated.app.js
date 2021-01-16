/*!
 * MLP.Client.Components.App.Unauthenticated
 * File: unauthenticated.app.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import Navigator from '../common/navigator';
import BoundaryError from '../error/boundary.error';
import Viewer from '../viewer/viewer';
import Footer from '../common/footer';
import React from 'react';
import HeaderViewer from '../viewer/header.viewer';

/**
 * Main app component for unauthenticated users.
 *
 * @public
 */

const UnauthenticatedApp = () => {
    return (
        <div className={"page-content"}>
            <HeaderViewer/>
            <main>
                <Navigator/>
                <BoundaryError>
                    <Viewer/>
                </BoundaryError>
            </main>
            <Footer/>
        </div>
    );
}

export default UnauthenticatedApp;
