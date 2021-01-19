/*!
 * MLP.Client.Context.App
 * File: app.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {AuthProvider} from './auth.provider.client'
import {DataProvider} from './data.provider.client'
import {UserProvider} from './user.provider.client'

function AppProviders({children}) {
    return (
            <DataProvider>
                <AuthProvider>
                    <UserProvider>
                        {children}
                    </UserProvider>
                </AuthProvider>
            </DataProvider>
    )
}

export default AppProviders