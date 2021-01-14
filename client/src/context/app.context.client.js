/*!
 * MLP.Client.Context.App
 * File: app.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import {AuthProvider} from './auth.context.client'
import {UserProvider} from './user.context.client'
import {MsgProvider} from './msg.context.client'

function AppProviders({children}) {
    return (
        <AuthProvider>
            <UserProvider>
                <MsgProvider>
                    {children}
                </MsgProvider>
            </UserProvider>
        </AuthProvider>
    )
}

export default AppProviders