/*!
 * MLP.Client.App
 * File: App.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {useUser} from './_providers/user.provider.client';
import AuthenticatedApp from './_components/app/authenticated.app';
import UnauthenticatedApp from './_components/app/unauthenticated.app';

/**
 * Core client application component.
 *
 * @public
 */

function App() {
    const user = useUser();
    return user ? <AuthenticatedApp /> : <UnauthenticatedApp />
}

export default App;