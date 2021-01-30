/*!
 * MLP.Client.Components.Common.Messenger
 * File: messenger.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { useRouter } from '../../_providers/router.provider.client';
import { popSessionMsg } from '../../_services/session.services.client';

/**
 * Messenger component.
 *
 * @public
 */

const Messenger = () => {

    // initialize user message in state
    const [message, setMessage] = React.useState(null);

    /**
     * Load message from session storage
     *
     * @private
     */

    React.useEffect(() => {
        setMessage(popSessionMsg())
        return () => {};
    }, []);

    const {msg='', type=''} = message || {};

    return (
        message ? <div className={`msg ${type}`}>{msg}</div> : ''
    )
}

export default Messenger;
