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
import Icon from './icon';

/**
 * Messenger component.
 *
 * @public
 */

const Messenger = ({closeable=true, message='', level='', retires=false}) => {

    // message timer
    const timer = () => {
        popSessionMsg();
        api.setMessage(null);
    }

    const api = useData();
    const [intervalID, setIntervalID] = React.useState(
        retires && getSessionMsg() ? setInterval(timer, 4000) : null
    );

    /**
     * Handle close of message.
     *
     * @public
     */

    const handleClose = () => {
        clearInterval(intervalID);
        popSessionMsg();
        api.setMessage(null);
    }

    // destructure message data from API provider
    const { msg=message, type=level } = api.message || {};

    return msg && type &&
        <div className={`msg ${type}`}>
            <div className={'msg-icon'}><Icon type={type} /></div>
            <div className={'msg-text'}>{msg}</div>
            {
                closeable &&
                <div className={'close'}>
                    <Button icon={'close'} onClick={handleClose} />
                </div>
            }
        </div>
}

export default React.memo(Messenger);
