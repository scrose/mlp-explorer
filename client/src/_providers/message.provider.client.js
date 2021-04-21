/*!
 * MLP.Client.Providers.Message
 * File: message.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react';
import { getSessionMsg, popSessionMsg } from '../_services/session.services.client';
import { getQuery } from '../_utils/paths.utils.client';

/**
 * Global messenger.
 *
 * @public
 */

const MessageContext = React.createContext({})

/**
 * Provider component to allow consuming components to subscribe to
 * global messages.
 *
 * @public
 */

function MessageProvider(props) {

    // pop session message on redirect
    let [message, setMessage] = React.useState(
        getQuery('redirect') ? getSessionMsg() : null
    );

    return (
        <MessageContext.Provider value={{message, setMessage}} {...props}  />
    )

}

const useMessage = () => React.useContext(MessageContext);

export {useMessage, MessageProvider};
