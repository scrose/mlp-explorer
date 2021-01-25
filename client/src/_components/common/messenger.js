/*!
 * MLP.Client.Components.Common.Messenger
 * File: messenger.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { checkSessionMsg, getSessionMsg, popSessionMsg } from '../../_services/session.services.client';

/**
 * Messenger component.
 *
 * @public
 */

const Messenger = () => {

    // initialize view messages with session storage
    const [messages, setMessages] = React.useState([]);

    // update message from session storage
    React.useEffect(() => {
        console.log(getSessionMsg())
        if (checkSessionMsg())
                setMessages(popSessionMsg())

    }, [setMessages]);

    return (
        Array.isArray(messages)
            ? <div className={'msgs'}>
            {messages.map((message, index) => {
                const {msg='', type=''} = message || {};
                return (msg && type ? <div className={`msg ${type}`} key={`msg_${index}`}>{msg}</div> : '')
            })}
        </div>
            : ''
    )
}

export default Messenger;
