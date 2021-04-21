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
import { redirect } from '../../_utils/paths.utils.client';
import { getSessionMsg, popSessionMsg, setSessionMsg } from '../../_services/session.services.client';
import { genSchema } from '../../_services/schema.services.client';
import Loading from '../common/icon';
import { useData } from '../../_providers/data.provider.client';
import { useMessage } from '../../_providers/message.provider.client';

/**
 * User sign in form component.
 *
 * @public
 */

const LoginUsers = () => {

    const user = useUser();
    const auth = useAuth();
    const msg = useMessage();
    const schema = genSchema('login', 'users');

    // Redirect to dashboard if logged in
    React.useEffect(() => {
        if (user) {
            setSessionMsg({msg: 'User is signed in.', type:'info'});
            redirect('/?redirect=true');
        }
        return () => {};
    }, [user]);

    return user
        ? <Loading />
        : <div>
                <Form
                    model={'users'}
                    schema={schema}
                    callback={auth.login}
                    route={'/login'}
                />
          </div>
}

export default React.memo(LoginUsers);
