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
import { setSessionMsg } from '../../_services/session.services.client';
import { genSchema } from '../../_services/schema.services.client';
import Loading from '../common/loading';
import { UserMessage } from '../common/message';

/**
 * User sign in form component.
 *
 * @public
 */

const LoginUsers = () => {

    const user = useUser();
    const auth = useAuth();
    const schema = genSchema('login', 'users');
    const [message, setMessage] = React.useState(null);

    // login callback
    const _callback = async (route, credentials) => {
        setMessage(null);
        const msgData = await auth.login(route, credentials);
        setMessage(msgData)
    }

    // Redirect to dashboard if logged in
    React.useEffect(() => {
        if (user) {
            setSessionMsg({msg: 'User is signed in.', type:'info'});
            redirect('/?redirect=true');
        }
        return () => {};
    }, [user]);

    return user
        ? <div>User {user.email} is signed in.</div>
        : <div>
            <UserMessage
                message={message}
                onClose={() => {setMessage(false)}}
            />
                <Form
                    model={'users'}
                    schema={schema}
                    callback={_callback}
                    route={'/login'}
                />
          </div>
}

export default React.memo(LoginUsers);
