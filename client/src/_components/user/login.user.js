/*!
 * MLP.Client.Components.User.Login
 * File: login.user.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import { getSchema } from '../../_services/schema.services.client';
import { useUser } from '../../_providers/user.provider.client';
import { useAuth } from '../../_providers/auth.provider.client';
import { redirect } from '../../_utils/paths.utils.client';

const LoginUser = () => {

    // lookup view in schema
    const loginProps = { schema: getSchema('login', 'users') };
    const user = useUser();
    const auth = useAuth();

    // Redirect to dashboard if logged in
    React.useEffect(() => {
        if (user) redirect('/?msg=isLoggedIn');
    }, []);

    return user
        ? <div><p>User is logged in. Redirecting...</p></div>
        : <Form route={'/login'} props={loginProps} callback={auth.login} />
}

export default LoginUser;
