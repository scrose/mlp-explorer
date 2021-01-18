/*!
 * MLP.Client.Providers.Messenger
 * File: messenger.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { getQuery } from '../_utils/paths.utils.client';
import { getMsg, getSession, popMsg, setSession } from '../_services/session.services.client';

/**
 * Create messenger context.
 */

const MsgContext = React.createContext({});

/**
 * Define message provider.
 *
 * @public
 * @param {Object} props
 */

function MsgProvider(props) {

    // initialize message with session storage
    const [data, setData] = React.useState(getMsg());

    const set = (msg) => {
        setData([msg]);
    }

    const get = () => {
        const messages = popMsg();
        setData(messages);
        return messages;
    }

    return (
        <MsgContext.Provider value={{data, get, set}} {...props} />
    )
}

const useMsg = () => React.useContext(MsgContext);
export {MsgProvider, useMsg}
