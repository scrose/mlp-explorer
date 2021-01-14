/*!
 * MLP.Client.Context.Providers
 * File: providers.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import Loading from '../components/common/loading';
import { getSession, getSessionToken, removeSession } from '../services/session.services.client';
import { auth } from '../services/api.services.client';
const AuthContext = React.createContext({})

function AuthProvider(props) {

    // Pre-load user session data
    let data = {};
    let isLoaded = false;
    const token = getSessionToken();
    console.log('Token:', token, data)

    /*
      Post-pone rendering any of the children until after we've
      determined whether or not we have a user token and if we do,
      then we render a spinner while we go retrieve that user's
      information.
     */

    if (token) {
        console.log('Token found:', token)
        auth(token)
            .then(res => {
                console.log('Auth response:', res)
                data = res.user;
                isLoaded = true;
            });
        if (!isLoaded) return <Loading />
    }

    // Login request
    const login = () => {
        console.log('Login!!')
    }

    // registration request
    const register = () => {
        console.log('Registration!!')
    }

    // register the user
    const logout = () => {
        console.log('Logout!!');
        removeSession();
    }

    /*
    Value is not optimized with React.useMemo here because this
    is the top-most component rendered in our app and it will very
    rarely re-render/cause a performance problem.
    */

    return (
        <AuthContext.Provider value={{data, login, logout, register}} {...props} />
    )

}

const useAuth = () => React.useContext(AuthContext)
export {AuthProvider, useAuth}
