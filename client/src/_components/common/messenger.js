/*!
 * MLP.Client.Components.Common.Messenger
 * File: messenger.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { checkMsg, getMsg, popMsg } from '../../_services/session.services.client';

/**
 * Messenger component.
 *
 * @public
 */

const Messenger = () => {

    // initialize message with session storage
    const [messages, setMessages] = React.useState(getMsg());

    // load messages in state (if available) or storage and clear
    React.useEffect(() => {
        if (checkMsg()) setMessages(popMsg());
    }, [setMessages]);

    return (
        <div className={'msgs'}>
            {messages.map((message, index) => {
                const {msg='', type=''} = message;
                return (msg && type ? <div className={`msg ${type}`} key={`msg_${index}`}>{msg}</div> : '')
            })}
        </div>
    )
}

export default Messenger;
