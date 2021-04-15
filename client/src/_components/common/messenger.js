/*!
 * MLP.Client.Components.Common.Messenger
 * File: messenger.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import { useData } from '../../_providers/data.provider.client';
import Button from './button';
import Icon from './icon';
import { useRouter } from '../../_providers/router.provider.client';

/**
 * Messenger component.
 *
 * @public
 */

const Messenger = ({closeable=true, message='', level=''}) => {


    const api = useData();
    const router = useRouter();

    // // message timer
    // const timer = () => {
    //     api.setMessage(null);
    // }
    //
    // // get timer interval ID
    // const [intervalID, setIntervalID] = React.useState(
    //     retires && getSessionMsg() ? setInterval(timer, 4000) : null
    // );

    /**
     * Handle close of message.
     *
     * @public
     */

    const handleClose = () => {
        api.setMessage(null);
        router.setError(null);
    }

    // destructure message data from API provider and router
    const { msg=message, type=level } = api.message || router.error || {};

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
