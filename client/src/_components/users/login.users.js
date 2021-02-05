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
import { addSessionMsg } from '../../_services/session.services.client';
import { useMessenger } from '../../_providers/messenger.provider.client';
import { redirect } from '../../_utils/paths.utils.client';

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
    const msg = useMessenger();

    // Redirect to dashboard if logged in
    React.useEffect(() => {
        if (user) {
            addSessionMsg({msg: 'User is signed in.', type:'info'})
            redirect('/?msg=true');
        }
    }, [user, api, msg]);

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
