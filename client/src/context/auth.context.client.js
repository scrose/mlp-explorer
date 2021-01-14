/*!
 * MLP.Client.Context.Providers
 * File: providers.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import Loading from '../components/common/loading';
import { getSession, getSessionToken, removeSession, setSession } from '../services/session.services.client';
import { auth, getData, postData } from '../services/api.services.client';
import { useMsg } from './msg.context.client';

/**
 * Global authentication context.
 *
 * @public
 */

const AuthContext = React.createContext({})

/**
 * Provider component to allow consuming components to subscribe to
 * authentication context changes.
 *
 * @public
 * @param {Object} props
 */

function AuthProvider(props) {

    // loaded status
    let [isLoaded, setLoaded] = React.useState(false);
    let [data, setData] = React.useState({user: null});

    // Pre-load user session data
    const token = getSessionToken();
    console.log('Data, Token:', data, getSession());

    if (!token) setLoaded(false);

    // get messenger
    const messenger = useMsg();

    /*
      Post-pone rendering any of the children until after we've
      determined whether or not we have a user token and if we do,
      then we render a spinner while we go retrieve that user's
      information.
     */

    React.useEffect(() => {

        console.log('Token found:', token)
        if (!isLoaded)
            auth(token)
                .then(res => {
                    console.log('Auth response:', res.user)
                    setData(res.user);
                    setLoaded(true);
                });

    });

    if (!isLoaded) return <Loading />

    // Login request
    const login = (route, credentials) => {
        postData(route, credentials)
            .then(res => {
                setSession(res.user)
                console.log('New Session:', getSession())
                data.user = res.user
                messenger.setMessage(res.message)
            })
    }

    // registration request
    const register = (route) => {
        getData(route)
            .then(res => {
                messenger.setMessage(res.message)
            })
    }

    // register the user
    const logout = () => {
        removeSession();
        data.user = null;
        messenger.setMessage({msg:'User is logged out.', type:'success'})
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

/**
 * Wrapper to access context.
 *
 * @public
 */

const useAuth = () => React.useContext(AuthContext)
export {AuthProvider, useAuth}
