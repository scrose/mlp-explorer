/*!
 * MLP.Client.Providers.Messenger
 * File: messenger.provider.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import { getLocalMsg } from '../_services/schema.services.client';
import { getQuery } from '../_utils/paths.utils.client';


const MsgContext = React.createContext({});

function MsgProvider(props) {
    // check for any carried messages (in query parameters)
    const localMsgKey = getQuery('status');
    const [data, setMessage] = React.useState(getLocalMsg(localMsgKey));
    return (
        <MsgContext.Provider value={{data, setMessage}} {...props} />
    )
}

const useMsg = () => React.useContext(MsgContext);
export {MsgProvider, useMsg}
