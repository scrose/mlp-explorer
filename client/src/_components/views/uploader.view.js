/*!
 * MLP.Client.Components.Users.Login
 * File: login.users.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from "react";
import Form from '../common/form';
import { useRouter } from '../../_providers/router.provider.client';

/**
 * File(s) uploader view.
 *
 * @public
 */

const Uploader = ({model, schema, data}) => {

    const api = useRouter();

    return <Form
        model={model}
        schema={schema}
        data={data}
        callback={api.upload}
    />
}

export default React.memo(Uploader);
