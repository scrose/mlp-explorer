/*!
 * MLP.Client.Components.Common.Messenger
 * File: messenger.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { useMsg } from '../../_providers/msg.provider.client';
import MenuEditor from '../editor/menu.editor';

/**
 * Messenger component.
 *
 * @public
 */

const Messenger = () => {
    const messenger = useMsg();
    const {msg, type} = messenger.data;
    return (
        <>
            { msg && type ? <div className={`msg ${type}`}>{msg}</div> : '' }
        </>
    )
}

export default Messenger;
