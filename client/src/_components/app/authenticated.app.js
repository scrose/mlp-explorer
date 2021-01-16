/*!
 * MLP.Client.Components.App.Authenticated
 * File: authenticated.app.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import Navigator from '../common/navigator';
import BoundaryError from '../error/boundary.error';
import Footer from '../common/footer';
import React from 'react';
import Editor from '../editor/editor';
import HeaderEditor from '../editor/header.editor';

/**
 * Main app component for unauthenticated users.
 *
 * @public
 */

const AuthenticatedApp = () => {
    return (
        <div className={"page-content"}>
            <HeaderEditor />
            <main>
                <Navigator/>
                <BoundaryError>
                    <Editor/>
                </BoundaryError>
            </main>
            <Footer/>
        </div>
    );
}

export default AuthenticatedApp;
