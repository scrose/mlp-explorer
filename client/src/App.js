/*!
 * MLP.Client.App
 * File: App.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {useUser} from './_providers/user.provider.client';
import EditorApp from './_components/app/editor.app';
import ViewerApp from './_components/app/viewer.app';

/**
 * Core client application component.
 *
 * @public
 */

function App() {
    const user = useUser();
    return user ? <EditorApp /> : <ViewerApp />
}

export default App;