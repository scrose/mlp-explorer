/*!
 * MLP.Client.Providers.Authenticate
 * File: auth.providers.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { useRouter } from './router.provider.client';
import { setSessionMsg } from '../_services/session.services.client';
import { useMessage } from './message.provider.client';

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

    const _isMounted = React.useRef(false);
    let [data, setData] = React.useState(null);

    const router = useRouter();
    const msg = useMessage();

    /**
     * User login request.
     *
     * @public
     *
     */

    const login = async (route, credentials) => {
        return await router.post('/login', credentials)
            .then(res => {
                // create user session
                const { response={} } = res || {};
                const { user=null, message={} } = response || {};
                msg.setMessage(message);
                if (user) setData(user);
            });
    }

    /**
     * User logout request
     *
     * @public
     */

    const logout = async () => {
        await router.post('/logout')
            .then(res => {
                // Note: Keycloak logout operation returns no_static (204)
                setData(null);
            });
    }

    /**
     * Post-Render: Refresh access token with API.
     *
     * @public
     */

    React.useEffect(() => {
        _isMounted.current = true;

        // request new token
        router.post('/refresh', null, true)
            .then(res => {
                const { response={} } = res || {};
                const { user = null } = response || {};
                if (_isMounted.current) {
                    setData(user);
                }
            });
        return () => {
            _isMounted.current = false;
        };

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
