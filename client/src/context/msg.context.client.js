/*!
 * MLP.Client.Context.Providers
 * File: providers.context.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import * as React from 'react'
import Loading from '../components/common/loading';
import { getSession, getSessionToken, removeSession } from '../services/session.services.client';
const MsgContext = React.createContext({})

function MsgProvider(props) {

    // messenger state
    const [msg, setMsg] = React.useState({});

    return (
        <MsgContext.Provider value={{msg, setMsg}} {...props} />
    )

}

const useMsg = () => React.useContext(MsgContext)
export {MsgProvider, useMsg}
