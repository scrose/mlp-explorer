/*!
 * MLP.Client.App
 * File: App.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {useUser} from './context/user.context.client';
import Authenticated from './components/common/app.authenticated';
import Unauthenticated from './components/common/app.unauthenticated';

/**
 * Core client application component.
 *
 * @public
 */

function App() {
    const user = useUser();
    return user ? <Authenticated /> : <Unauthenticated />
}

export default App;