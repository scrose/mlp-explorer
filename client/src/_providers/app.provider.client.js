/*!
 * MLP.Client.Context.App
 * File: app.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {AuthProvider} from './auth.provider.client'
import {UserProvider} from './user.provider.client'
import {MsgProvider} from './msg.provider.client'

function AppProviders({children}) {
    return (
        <MsgProvider>
            <AuthProvider>
                <UserProvider>
                        {children}
                </UserProvider>
            </AuthProvider>
        </MsgProvider>
    )
}

export default AppProviders