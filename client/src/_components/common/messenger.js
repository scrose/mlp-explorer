/*!
 * MLP.Client.Components.Common.Messenger
 * File: messenger.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { useMessenger } from '../../_providers/messenger.provider.client';

/**
 * Messenger component.
 *
 * @public
 */

const Messenger = () => {

    const messenger = useMessenger();

    const { message={} } = messenger || {};
    const { msg='', type='' } = message || {};

    return (
        msg && type ? <div className={`msg ${type}`}>{msg}</div> : ''
    )
}

export default React.memo(Messenger);
