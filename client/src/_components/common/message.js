/*!
 * MLP.Client.Components.Common.Message
 * File: message.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Icon from './icon';
import { useMessage } from '../../_providers/message.provider.client';
import { getQuery } from '../../_utils/paths.utils.client';

/**
 * Message component.
 *
 * @public
 */

const Message = ({closeable=true, message='', level=''}) => {

    const messenger = useMessage();

    // get current or set message
    const { msg = '', type = '' }  = messenger.message || {};
    let messageText = message ? message : msg;
    let messageType = level ? level : type;

    /**
     * Handle close of message.
     *
     * @public
     */

    const handleClose = () => {
        messageText = null;
        messageType = null;
        messenger.setMessage(null);
    };

    return messageText && messageType &&
        <div className={`msg ${messageType}`}>
            <div className={'msg-icon'}><Icon type={messageType}/></div>
            <div className={'msg-text'}>{messageText}</div>
            {
                closeable &&
                <div className={'close'}>
                    <Button icon={'close'} onClick={handleClose}/>
                </div>
            }
        </div>;
};

export default React.memo(Message);