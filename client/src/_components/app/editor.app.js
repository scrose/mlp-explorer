/*!
 * MLP.Client.Components.App.Authenticated
 * File: authenticated.app.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import Navigator from '../navigator/navigator';
import BoundaryError from '../error/boundary.error';
import Footer from '../common/footer';
import React from 'react';
import Editor from '../editor/editor';
import HeaderEditor from '../editor/header.editor';

/**
 * Main app component for authenticated users.
 *
 * @public
 */

const EditorApp = () => {
    return (
        <div className={"page-content"}>
            <HeaderEditor />
                <main>
                    <div className={'main'}>
                        <BoundaryError>
                            <Navigator/>
                        </BoundaryError>
                        <BoundaryError>
                            <Editor/>
                        </BoundaryError>
                    </div>
                </main>
            <Footer/>
        </div>
    );
}

export default EditorApp;
