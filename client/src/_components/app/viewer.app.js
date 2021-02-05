/*!
 * MLP.Client.Components.App.Viewer
 * File: viewer.app.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import Navigator from '../navigator/navigator';
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

const ViewerApp = () => {
    return (
        <div className={"page-content"}>
            <HeaderViewer/>
            <main>
                <div className={'main'}>
                    <BoundaryError>
                        <Navigator/>
                    </BoundaryError>
                    <BoundaryError>
                        <Viewer/>
                    </BoundaryError>
                </div>
            </main>
            <Footer/>
        </div>
    );
}

export default ViewerApp;
