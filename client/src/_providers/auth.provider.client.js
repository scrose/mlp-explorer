/*!
 * MLP.Client.Context.Providers
 * File: providers.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { getSession, getSessionToken, clearSession, setSession, addSessionMsg } from '../_services/session.services.client';
import { makeRequest } from '../_services/data.services.client';
import { useData } from './data.provider.client';
import { redirect } from '../_utils/paths.utils.client';
import { getError } from '../_services/schema.services.client';

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

    let [data, setData] = React.useState(getSession());

    // get providers
    const api = useData();

    /*
      Post-pone rendering any of the children until after we've
      determined whether or not we have a user token and if we do,
      then we render a spinner while we go retrieve that user's
      information.
     */

    // user login request
    const login = async function(route, credentials) {
        return await api.post(route, credentials)
            .then(res => {
                const {user} = res || {};
                console.log('Logged in user:', user)

                // create user session on success
                if (user) {
                    setSession(user);
                    setData(user);
                    return (res)

                    // return redirect('/');
                }
                console.error({msg: getError('noAuth', 'authentication'), type: 'error'})
                addSessionMsg({msg: getError('noAuth', 'authentication'), type: 'error'})
                //return redirect('/login');
            })
    }

    // register the user
    const logout = () => {
        clearSession();
        addSessionMsg({ msg: 'Logged out successfully!', type: 'success' });
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
        <AuthContext.Provider value={{data, login, logout}} {...props} />
    )

}

const useAuth = () => React.useContext(AuthContext);
export {useAuth, AuthProvider};
