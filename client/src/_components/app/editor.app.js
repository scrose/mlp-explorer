/*!
 * MLP.Client.Components.App.Editor
 * File: editor.app.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Navigator from '../navigator/navigator';
import BoundaryError from '../error/boundary.error';
import Footer from '../common/footer';
import Editor from '../editor/editor';
import HeaderEditor from '../editor/header.editor';
import EditorMenu from '../menus/editor.menu';

/**
 * Main app component for authenticated users.
 *
 * @public
 */

const EditorApp = () => {
    return (
        <div className={"page-_static"}>
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
