/*!
 * MLP.Client.Context.Providers
 * File: providers.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { useRouter } from './router.provider.client';
import { addSessionMsg } from '../_services/session.services.client';
import { redirect } from '../_utils/paths.utils.client';

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
    const router = useRouter();

    /**
     * User login request.
     *
     * @public
     */

    const login = async (route, credentials) => {
        return await router.post('/login', credentials)
            .then(res => {
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
        const res = await router.post('/logout')
            .then(res => {
                // Note: Keycloak logout operation returns no content (204)
                setData(null);
            });
        addSessionMsg({msg: 'User is signed out.', type:'info'});
        return redirect('/');
    }

    /**
     * Post-Render: Refresh access token with API.
     *
     * @public
     */

    React.useEffect(() => {
        router.post('/refresh')
            .then(res => {
                // reset user session data
                const { user=null } = res || {};
                setData(user);
            })
        return () => {};
    }, [router]);

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
