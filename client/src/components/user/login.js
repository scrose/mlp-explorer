/*!
 * MLP.Client.Components.User.Login
 * File: login.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import { getSchema } from '../../services/schema.services.client';
import Dashboard from './dashboard';
import { useUser } from '../../context/user.context.client';
import { useAuth } from '../../context/auth.context.client';

const Login = () => {

    // lookup view in schema
    const loginProps = { schema: getSchema('login', 'users') };
    const user = useUser();
    const auth = useAuth();

    console.log('Login?', user)

    return user
        ? <Dashboard/>
        : <Form route={'/login'} props={loginProps} callback={auth.login} />
}

export default Login;
