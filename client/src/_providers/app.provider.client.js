/*!
 * MLP.Client.Provider.App
 * File: app.provider.client.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { AuthProvider } from './auth.provider.client';
import { RouterProvider } from './router.provider.client';
import { UserProvider } from './user.provider.client';
import { DataProvider } from './data.provider.client';
import { NavProvider } from "./nav.provider.client";
import { DialogProvider } from "./dialog.provider.client";

function AppProviders({ children }) {
    return (
        <RouterProvider>
            <AuthProvider>
                <UserProvider>
                    <DataProvider>
                        <NavProvider>
                            <DialogProvider>
                            {children}
                            </DialogProvider>
                        </NavProvider>
                    </DataProvider>
                </UserProvider>
            </AuthProvider>
        </RouterProvider>
    );
}

export default AppProviders;