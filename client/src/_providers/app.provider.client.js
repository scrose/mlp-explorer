/*!
 * MLP.Client.Provider.App
 * File: app.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { AuthProvider } from './auth.provider.client';
import { RouterProvider } from './router.provider.client';
import { UserProvider } from './user.provider.client';
import { DataProvider } from './data.provider.client';
import { MessageProvider } from './message.provider.client';

function AppProviders({ children }) {
    return (
        <MessageProvider>
            <RouterProvider>
                <AuthProvider>
                    <UserProvider>
                        <DataProvider>
                            {children}
                        </DataProvider>
                    </UserProvider>
                </AuthProvider>
            </RouterProvider>
        </MessageProvider>
    );
}

export default AppProviders;