/*!
 * MLP.Client.Context.App
 * File: app.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {AuthProvider} from './auth.provider.client'
import {RouterProvider} from './router.provider.client'
import {UserProvider} from './user.provider.client'
import { MsgProvider } from './messenger.provider.client';

function AppProviders({children}) {
    return (
            <RouterProvider>
                <AuthProvider>
                    <UserProvider>
                        <MsgProvider>
                            {children}
                        </MsgProvider>
                    </UserProvider>
                </AuthProvider>
            </RouterProvider>
    )
}

export default AppProviders