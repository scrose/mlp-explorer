/*!
 * MLP.Client.Components.Common.Alert
 * File: alert.js
 * Copyright(c) 2021 Runtime Software Development Inc.
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

const Alert = ({title, setToggle, callback, children}) => {
    return (
        <Dialog setToggle={setToggle} title={title}>
            <div className={'alert-box'}>
                {children}
                <div className={'alert-box-buttons'}>
                    <Button icon={'success'} name={'ok'} label={'OK'} onClick={callback} />
                    <Button icon={'cancel'} name={'cancel'} label={'Cancel'} onClick={()=> {
                        setToggle(false);
                    }} />
                </div>
            </div>
        </Dialog>
    );
}

export default Alert;
