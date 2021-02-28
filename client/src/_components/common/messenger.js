/*!
 * MLP.Client.Components.Common.Messenger
 * File: messenger.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { getSessionMsg, popSessionMsg } from '../../_services/session.services.client';
import { useData } from '../../_providers/data.provider.client';
import Button from './button';

/**
 * Messenger component.
 *
 * @public
 */

const Messenger = () => {

    const api = useData();

    /**
     * User login request.
     *
     * @public
     */

    const handleClose = () => {
        popSessionMsg();
        api.setMessage(null);
    }

    // destructure message data from API provider
    const { msg='', type='' } = api.message || {};

    return (
        msg && type
            ?   <div className={`msg ${type}`}>
                    {msg}
                    <div className={'close'}>
                        <Button icon={'close'} onClick={handleClose} />
                    </div>
                </div>
            : ''
    )
}

export default React.memo(Messenger);
