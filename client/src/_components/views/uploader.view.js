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
import { useData } from '../../_providers/data.provider.client';

/**
 * User sign in form component.
 *
 * @public
 */

const Uploader = ({data, view, model}) => {

    console.log('Uploader:', data, view, model)

    const router = useRouter();
    const api = useData();

    // Redirect to dashboard if logged in
    React.useEffect(() => {
        return () => {};
    }, [router, api]);

    return <Form
        view={view}
        model={model}
        data={data}
        callback={api.upload}
    />
}

export default React.memo(Uploader);
