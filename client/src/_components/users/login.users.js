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
import { UserMessage } from '../common/message';
import {useRouter} from "../../_providers/router.provider.client";

/**
 * User sign in form component.
 *
 * @public
 */

const LoginUsers = () => {

    const user = useUser();
    const auth = useAuth();
    const schema = genSchema({ view:'login', model:'users'});
    const [message, setMessage] = React.useState(null);

    // login callback
    const _callback = async (route, credentials) => {
        auth.login(route, credentials).then(msg => {
            if (msg) setMessage(msg);
        });
    }

    return user
        ? <div>User {user.email} is signed in.</div>
        : <div className={'login'}>
            <UserMessage
                message={message}
                closeable={false}
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
