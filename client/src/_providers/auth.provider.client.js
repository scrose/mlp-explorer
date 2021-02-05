/*!
 * MLP.Client.Context.Providers
 * File: providers.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { useRouter } from './router.provider.client';
import { useMessenger } from './messenger.provider.client';
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

    // messenger
    const msg = useMessenger();

    /**
     * User login request.
     *
     * @public
     */

    const login = async (route, credentials) => {
        return await api.post('/login', credentials)
            .then(res => {

                // send message
                const { message='' } = res || {};
                msg.setMessage(message);

                const { user=null } = res || {};

                // create user session on success
                if (user) {
                    setData(user);
                }
                return res

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
                // Keycloak logout operation returns no content (204)
                setData(null);
                msg.setMessage({ msg: 'Logged out successfully!', type: 'success' });
            })
    }

    /**
     * Post-Render: Refresh access token with API.
     *
     * @public
     */

    React.useEffect(() => {
        api.post('/refresh')
            .then(res => {
                // reset user session data
                const { user=null } = res || {};
                setData(user);
            })
        return () => {};
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
