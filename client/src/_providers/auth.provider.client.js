/*!
 * MLP.Client.Context.Providers
 * File: providers.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { useRouter } from './router.provider.client';
import { addSessionMsg } from '../_services/session.services.client';

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

    let [data, setData] = React.useState(null);

    // get providers
    const api = useRouter();

    /**
     * User login request.
     *
     * @public
     */

    const login = async (route, credentials) => {
        return await api.post('/login', credentials)
            .then(res => {
                console.log('Login Response:', res)
                const { user=null } = res || {};

                // create user session on success
                if (user) {
                    setData(user);
                }

                return res

                // console.error(getError('noAuth', 'authentication'));
                // addSessionMsg({msg: getError('noAuth', 'authentication'), type: 'error'})
            });
    }

    /**
     * User logout request
     *
     * @public
     */

    const logout = async () => {
        return await api.post('/logout')
            .then(res => {
                console.log('Logout Response:', res);

                if (res.status !== 200) {
                    addSessionMsg({ msg: 'Failed to sign out user.', type: 'error' });
                    console.error('Logout failed', res);
                    return null;
                }

                setData(null);
                addSessionMsg({ msg: 'Logged out successfully!', type: 'success' });

                return res

            })
    }


    /*
      Post-pone rendering any of the children until after we've
      determined whether or not we have a user token and if we do,
      then we render a spinner while we go retrieve that user's
      information.
     */

    /**
     * Post-Render: Authenticate user token with API.
     *
     * @public
     */

    React.useEffect(() => {
        console.log('Refreshing token...')
        api.post('/refresh')
            .then(res => {

                const { user= null } = res || {};

                console.log('Refreshed:', res, user);

                // reset user session data
                if (user) {
                    setData(user);
                }
                return res

            })
    }, [api]);

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
