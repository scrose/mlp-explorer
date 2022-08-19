/*!
 * MLP.Client.Components.Common.Message
 * File: message.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Icon from './icon';
import { getSessionMsg, popSessionMsg } from '../../_services/session.services.client';
import { getQuery } from '../../_utils/paths.utils.client';

/**
 * System message component.
 *
 * @param closeable
 * @param message
 * @param level
 * @public
 */

const Message = ({closeable=true, message='', icon=''}) => {

    // check if redirect
    const redirected = getQuery('redirect');
    const [msgData, setMsgData] = React.useState(message || redirected ? getSessionMsg() : popSessionMsg());

    // clear session messages
    React.useEffect(() => {
        return ()=> { if(redirected) popSessionMsg() }
    }, [redirected]);

    /**
     * Handle close of message.
     *
     * @public
     */

    const _handleClose = () => {
        setMsgData(null)
        popSessionMsg();
    };

    return <UserMessage
        icon={icon}
        closeable={closeable}
        message={msgData}
        onClose={_handleClose}
    />;
};

export default Message;

/**
 * Generic user message component.
 * - Prints first message to page
 * - use for form and control validation
 *
 * @public
 * @param message
 * @param closeable
 * @param className
 * @param error
 */

export const UserMessage = ({
                                message,
                                closeable = true,
                                scrollTo=false,
                                className = '',
                                icon=null,
                                onClose=()=>{}
                            }) => {

    const container = React.useRef(null);
    const { msg = '', type = 'error' } = message || {};
    const [toggle, setToggle] = React.useState(true);

    // scroll to position of message on page
    React.useEffect(() => {
        if (scrollTo && container.current) container.current.scrollIntoView();
    }, [container, scrollTo]);

    return toggle && !!msg && !!type &&
        <div className={`msg ${type} ${className}`}>
            {
                (icon || type) && <div className={`msg-icon`}><Icon type={icon || type} /></div>
            }
            <div className={'msg-text'}>{msg}</div>
            {
                closeable &&
                <div className={'close'}>
                    <Button className={type}
                            icon={'close'}
                            onClick={() =>{
                                setToggle(false);
                                onClose();
                            }}
                    />
                </div>
            }
        </div>;
};