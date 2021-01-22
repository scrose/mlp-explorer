/*!
 * MLP.Client.Components.User.Login
 * File: login.user.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import Loading from '../common/loading';
import { genSchema } from '../../_services/schema.services.client';
import { useUser } from '../../_providers/user.provider.client';
import { useAuth } from '../../_providers/auth.provider.client';
import { redirect } from '../../_utils/paths.utils.client';
import { addMsg } from '../../_services/session.services.client';
import Heading from '../common/heading';

const LoginUsers = () => {

    // lookup view in schema
    const user = useUser();
    const auth = useAuth();

    // Redirect to dashboard if logged in
    React.useEffect(() => {
        if (user) {
            addMsg({msg:'User is logged in.', type:'info'});
            redirect('/');
        }
    }, []);

    return user
        ? <Loading />
        : <>
            <Heading model={''} text={'Sign In'}/>
            <Form route={'/login'} schema={genSchema('login', 'users')} callback={auth.login} />
          </>
}

export default LoginUsers;
