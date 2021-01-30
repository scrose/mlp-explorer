/*!
 * MLP.Client.Components.Users.Login
 * File: login.users.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import { useUser } from '../../_providers/user.provider.client';
import { useAuth } from '../../_providers/auth.provider.client';
import { useRouter } from '../../_providers/router.provider.client';

/**
 * User sign in form component.
 *
 * @public
 */

const LoginUsers = () => {

    // create dynamic view state
    const [data, setData] = React.useState({});

    const user = useUser();
    const auth = useAuth();
    const api = useRouter();

    // Redirect to dashboard if logged in
    React.useEffect(() => {
        console.log(api.route, api.staticView, user)
        if (user) {
            // api.setMessage({ msg: 'User is logged in.', type: 'info' });
            console.log('Logged in Already!', user)
            // redirect('/');
        }
    }, [user, api]);

    return user
        ? <div><p>User currently logged in.</p></div>
        : <div>
                <Form
                    view={'login'}
                    model={'users'}
                    data={data}
                    setData={setData}
                    callback={auth.login}
                />
          </div>
}

export default React.memo(LoginUsers);
