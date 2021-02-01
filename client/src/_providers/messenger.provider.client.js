/*!
 * MLP.Client.Providers.Messenger
 * File: messenger.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'

/**
 * Global data provider.
 *
 * @public
 */

const MsgContext = React.createContext({})

/**
 * Provider component to allow consuming components to subscribe to
 * API request handlers.
 *
 * @public
 * @param {Object} props
 */

function MsgProvider(props) {

    // Messenger state
    const [message, setMessage] = React.useState(null);

    return (
        <MsgContext.Provider value={
            {
                message,
                setMessage
            }
        } {...props} />
    )

}

const useMessenger = () => React.useContext(MsgContext);
export {useMessenger, MsgProvider};
