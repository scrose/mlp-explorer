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
import { addSessionMsg, checkSessionMsg, getSessionMsg, popSessionMsg } from '../../_services/session.services.client';
import Heading from '../common/heading';

const LoginUsers = ({messenger, setData}) => {

    // create dynamic view state
    const [values, setValues] = React.useState({});

    // lookup view in schema
    const schema = genSchema('login', 'users');
    console.log(schema)

    const user = useUser();
    const auth = useAuth();

    // Redirect to dashboard if logged in
    React.useEffect(() => {
        if (user) {
            addSessionMsg({ msg: 'User is logged in.', type: 'info' });
            redirect('/')
        }
    }, [addSessionMsg()]);

    return user
        ? <Loading />
        : <div className={'view'}>
            <Heading model={'users'} text={'Sign In'}/>
            <div className={'data'}>
                <Form
                    action={'/login'}
                    model={'users'}
                    legend={'Login'}
                    submit={'Sign In'}
                    fields={schema.fields}
                    data={values}
                    setData={setValues}
                    addMessage={messenger}
                    callback={auth.login}
                />
            </div>
          </div>
}

export default LoginUsers;
