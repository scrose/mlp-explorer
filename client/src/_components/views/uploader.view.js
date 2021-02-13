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
 * File(s) uploader view.
 *
 * @public
 */

const Uploader = ({model, schema, data}) => {


    console.log('Uploader:', data, schema, model)

    const api = useRouter();

    // convert

    return <Form
        model={model}
        schema={schema}
        data={data}
        callback={api.upload}
    />
}

export default React.memo(Uploader);
