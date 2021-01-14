/*!
 * MLP.Client.Components.User.Logout
 * File: Logout.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import { getSchema } from '../../services/schema.services.client';
import Dashboard from './Dashboard';
import { useUser } from '../../context/user.context.client';
import { useAuth } from '../../context/auth.context.client';

const Login = () => {

    // lookup view in schema
    const loginView = getSchema('login');
    const user = useUser();
    const auth = useAuth();

    return user ? <Dashboard/> : <Form
        route={'/login'}
        params={loginView}
        data={}
        callback={auth.login}
    />
}

export default Login;
