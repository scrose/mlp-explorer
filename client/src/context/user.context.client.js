/*!
 * MLP.Client.Context.User
 * File: user.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { useAuth } from './auth.context.client';
const UserContext = React.createContext({})

const UserProvider = props => (
    <UserContext.Provider value={useAuth().data.user} {...props} />
)

const useUser = () => React.useContext(UserContext);

export {UserProvider, useUser}
