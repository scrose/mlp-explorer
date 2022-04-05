/*!
 * MLP.Client.Components.Common.Alert
 * File: alert.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Dialog from './dialog';

/**
 * Alert dialog component.
 *
 * @public
 */

const Alert = ({
                   title,
                   setToggle,
                   callback=()=>{},
                   children
}) => {
    return (
        <Dialog setToggle={setToggle} title={title}>
            <div className={'alert-box'}>
                {children}
                <div className={'alert-box-buttons'}>
                    <Button icon={'success'} name={'ok'} label={'OK'} onClick={() => {
                        setToggle(null);
                        callback();
                    }} />
                </div>
            </div>
        </Dialog>
    );
}

export default Alert;
