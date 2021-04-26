/*!
 * MLP.Client.Components.Common.Message
 * File: message.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Icon from './icon';
import { getSessionMsg, popSessionMsg } from '../../_services/session.services.client';
import { getQuery } from '../../_utils/paths.utils.client';

/**
 * Message component.
 *
 * @public
 */

const Message = ({closeable=true, message='', level=''}) => {

    // check if redirect
    const redirected = getQuery('redirect');
    const [msgData, setMsgData] = React.useState(
        { msg: message, type: level } || redirected ? getSessionMsg() : popSessionMsg()
    );

    // get current or set message
    const { msg = message, type = level }  = msgData || {};

    /**
     * Handle close of message.
     *
     * @public
     */

    const handleClose = () => {
        setMsgData(null)
        popSessionMsg();
    };

    return msg && type &&
        <div className={`msg ${type}`}>
            <div className={'msg-icon'}><Icon type={type}/></div>
            <div className={'msg-text'}>{msg}</div>
            {
                closeable &&
                <div className={'close'}>
                    <Button icon={'close'} onClick={handleClose}/>
                </div>
            }
        </div>;
};

export default Message;