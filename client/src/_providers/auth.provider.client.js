/*!
 * MLP.Client.Context.Providers
 * File: providers.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { getSession, getSessionToken, removeSession, setSession } from '../_services/session.services.client';
import { getData, makeRequest, postData } from '../_services/api.services.client';
import { useMsg } from './msg.provider.client';

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
    let [data, setData] = React.useState(getSession());

    // Pre-load user session data
    console.log('Data, Token:', data);

    // get messenger
    const messenger = useMsg();

    /*
      Post-pone rendering any of the children until after we've
      determined whether or not we have a user token and if we do,
      then we render a spinner while we go retrieve that user's
      information.
     */

    React.useEffect(() => {
        const token = getSessionToken();
        if (token)
            auth()
                .then(res => {
                    if (!res) return;
                    const {user} = res;
                    if (user) setSession(user);
                });
    });

    // LoginUser request
    const login = (route, credentials) => {
        postData(route, credentials)
            .then(res => {
                const {user, message} = res;
                if (user) setSession(user);
                console.log('New Session:', getSession())
                setData(user)
                messenger.setMessage(message)
            })
    }

    // registration request
    const register = (route) => {
        getData(route)
            .then(res => {
                const {message} = res;
                messenger.setMessage(message)
            })
    }

    // register the user
    const logout = () => {
        removeSession();
        setData(null);
        messenger.setMessage({msg:'User is logged out.', type:'info'})
    }

    /**
     * Request wrapper to authenticate user token from API.
     *
     * @public
     */

    const auth = async function () {
        return await makeRequest({ url: '/auth', method: 'POST' })
            .then(res => {
                const { response } = res;
                // report API errors in console as warning
                if (!res.success)
                    console.warn(`An API error occurred (${res.statusText}): ${response.message.msg}.`);
                return response;
            })
            .catch(err => {
                console.error('An API error occurred:', err)
            });
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

const useAuth = () => React.useContext(AuthContext);
export {useAuth, AuthProvider};
