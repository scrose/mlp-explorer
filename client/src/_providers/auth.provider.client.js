/*!
 * MLP.Client.Context.Providers
 * File: providers.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { useRouter } from './router.provider.client';

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

    const login = async function(route, credentials) {
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
            })
    }

    /**
     * User logout request
     *
     * @public
     */

    const logout = () => {
        setData(null);
        api.setMessage({ msg: 'Logged out successfully!', type: 'success' });
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
        api.get('/refresh')
            .then(res => {
                // TODO: remove test user data
                // const { user= null } = res || {};

                const user = {
                    id: 'ITtqyWEPAEgQZEOwTUgOkyNuJ2bRvkUMiuLW1fOQ3FqNBzvS',
                    email: 'support@goruntime.ca',
                    role: 'super-administrator',
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IklUdHF5V0VQQUVnUVpFT3dUVWdPa3lOdUoyYlJ2a1VNaXVMVzFmT1EzRnFOQnp2UyIsImlhdCI6MTYxMjAzMjQ2OSwiZXhwIjoxNjEyMDMyNDY5fQ.ZN6IIEw_0FY6_23DlJ9XsA7xyO62RtB4sYqYqXjPbu0',
                    label: 'Super Administrator'
                    };

                console.log('Refresh Response:', res, user);

                // create user session on success
                if (user) {
                    setData(user);
                }

                return res

                // console.error(getError('noAuth', 'authentication'));
                // addSessionMsg({msg: getError('noAuth', 'authentication'), type: 'error'})
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
